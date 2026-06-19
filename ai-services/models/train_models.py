import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
from prophet import Prophet

# Set up paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "Dataset")
SAVED_DIR = os.path.join(BASE_DIR, "models", "saved")

os.makedirs(SAVED_DIR, exist_ok=True)

print("Starting Model Training Pipeline...")

print("\nTraining Prophet Model for Hotspots...")
df_ts = pd.read_csv(os.path.join(DATA_DIR, "time_series_prophet_sample.csv"))



# Shift dates to end yesterday so that forecasts correctly reach into the actual future
df_ts['ds'] = pd.to_datetime(df_ts['ds'])
delta = pd.Timestamp.today() - df_ts['ds'].max() - pd.Timedelta(days=1)
df_ts['ds'] = df_ts['ds'] + delta

# Inject a sparse area to test insufficient_data logic
sparse_df = pd.DataFrame({'ds': pd.date_range(end=pd.Timestamp.today()-pd.Timedelta(days=1), periods=15).strftime('%Y-%m-%d'), 'y': [2]*15, 'area': ['SparseArea']*15})
df_ts = pd.concat([df_ts, sparse_df], ignore_index=True)

# Train a separate Prophet model for ALL areas in the dataset
all_areas = df_ts['area'].value_counts().index.tolist()
prophet_models = {}
area_baselines = {}

for area in all_areas:
    df_area = df_ts[df_ts['area'] == area][['ds', 'y']].copy()
    
    MIN_SAMPLE_COUNT = 30
    raw_baseline = df_area['y'].quantile(0.90)

    if len(df_area) < MIN_SAMPLE_COUNT:
        area_baselines[area] = None  # flag sparse, backfill after loop
    else:
        area_baselines[area] = max(3.0, float(raw_baseline))

    if len(df_area) > 10:
        m = Prophet(daily_seasonality=True, yearly_seasonality=True)
        m.fit(df_area)
        prophet_models[area] = m

# After the loop ends, compute citywide median from qualifying areas only:
valid_baselines = [v for v in area_baselines.values() if v is not None]
citywide_median = float(np.median(valid_baselines)) if valid_baselines else 3.0

sparse_areas_list = []
# Backfill sparse areas:
for area in list(area_baselines.keys()):
    if area_baselines[area] is None:
        area_baselines[area] = citywide_median
        sparse_areas_list.append(area)

# Store citywide_median alongside area_baselines for unknown-area fallback at inference:
area_baselines['__citywide_median__'] = citywide_median
area_baselines['__sparse_areas__'] = sparse_areas_list

joblib.dump(prophet_models, os.path.join(SAVED_DIR, "prophet_models.joblib"))
joblib.dump(area_baselines, os.path.join(SAVED_DIR, "area_baselines.joblib"))
print(f"Prophet models and per-area baselines saved for areas: {all_areas}")

# ---------------------------------------------------------
# 2. XGBoost for Repeat Offenders (Enhanced)
# ---------------------------------------------------------
print("\nTraining Enhanced XGBoost for Repeat Offenders...")
df_offenders = pd.read_csv(os.path.join(DATA_DIR, "repeat_offenders_sample.csv"))



# Feature Engineering: Encode Categorical variables
le_crime_xgb = LabelEncoder()
df_offenders['primary_crime_type_encoded'] = le_crime_xgb.fit_transform(df_offenders['primary_crime_type'])

le_area_xgb = LabelEncoder()
df_offenders['area_encoded'] = le_area_xgb.fit_transform(df_offenders['area'])

joblib.dump(le_crime_xgb, os.path.join(SAVED_DIR, "le_crime_xgb.joblib"))
joblib.dump(le_area_xgb, os.path.join(SAVED_DIR, "le_area_xgb.joblib"))

features_xgb = ['prior_crime_count', 'days_since_last_crime', 'network_connections', 'escalation_score', 'primary_crime_type_encoded', 'area_encoded']
target_xgb = 'reoffended'

X_xgb = df_offenders[features_xgb]
y_xgb = df_offenders[target_xgb]

# Tuned Hyperparameters for higher accuracy
xgb_model = xgb.XGBClassifier(
    n_estimators=100, 
    max_depth=5, 
    learning_rate=0.01, 
    subsample=1.0, 
    colsample_bytree=0.8,
    random_state=42
)
xgb_model.fit(X_xgb, y_xgb)

joblib.dump(xgb_model, os.path.join(SAVED_DIR, "xgboost_offenders.joblib"))
print("Enhanced XGBoost model saved.")

# ---------------------------------------------------------
# 3. Data Prep for Crime Records (MLP & Random Forest)
# ---------------------------------------------------------
print("\nLoading and Preprocessing Crime Records...")
df_crimes = pd.read_csv(os.path.join(DATA_DIR, "crime_records_sample.csv"))



# Label Encode categorical features
le_area = LabelEncoder()
df_crimes['area_encoded'] = le_area.fit_transform(df_crimes['area'])

le_day = LabelEncoder()
df_crimes['day_encoded'] = le_day.fit_transform(df_crimes['day'])

le_crime = LabelEncoder()
df_crimes['crime_type_encoded'] = le_crime.fit_transform(df_crimes['crime_type'])

# Save encoders
joblib.dump(le_area, os.path.join(SAVED_DIR, "le_area.joblib"))
joblib.dump(le_day, os.path.join(SAVED_DIR, "le_day.joblib"))
joblib.dump(le_crime, os.path.join(SAVED_DIR, "le_crime.joblib"))

# Features for MLP & RF
features_crimes = ['area_encoded', 'hour', 'day_encoded', 'month', 'is_festival_period', 'is_night_crime', 'is_weekend']
X_crimes = df_crimes[features_crimes].values

# Scale features
scaler = StandardScaler()
X_crimes_scaled = scaler.fit_transform(X_crimes)
joblib.dump(scaler, os.path.join(SAVED_DIR, "scaler_crimes.joblib"))


# ---------------------------------------------------------
# 5. Isolation Forest for Emerging Threat Detection (Feature 4.4)
# ---------------------------------------------------------
print("\nTraining Isolation Forest for Emerging Threat Detection...")
iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
iso_forest.fit(X_crimes_scaled)

joblib.dump(iso_forest, os.path.join(SAVED_DIR, "iso_forest_threats.joblib"))
print("Isolation Forest anomaly detection model saved.")

print("\nAll models trained and saved successfully in ai-services/models/saved/")
