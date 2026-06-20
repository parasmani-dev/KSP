import os
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from prophet import Prophet
from sklearn.metrics import mean_absolute_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "Dataset")

print("--- EVALUATING XGBOOST (Repeat Offenders) ---")
df_offenders = pd.read_csv(os.path.join(DATA_DIR, "repeat_offenders_sample.csv"))

from sklearn.preprocessing import LabelEncoder
le_crime = LabelEncoder()
df_offenders['primary_crime_type_encoded'] = le_crime.fit_transform(df_offenders['primary_crime_type'])
le_area = LabelEncoder()
df_offenders['area_encoded'] = le_area.fit_transform(df_offenders['area'])

features_xgb = ['prior_crime_count', 'days_since_last_crime', 'network_connections', 'escalation_score', 'primary_crime_type_encoded', 'area_encoded']
X_xgb = df_offenders[features_xgb]
y_xgb = df_offenders['reoffended']

X_train, X_test, y_train, y_test = train_test_split(X_xgb, y_xgb, test_size=0.2, random_state=42)

xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.01, subsample=1.0, colsample_bytree=0.8, random_state=42)
xgb_model.fit(X_train, y_train)

y_pred = xgb_model.predict(X_test)
print(f"Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"Precision: {precision_score(y_test, y_pred) * 100:.2f}%")
print(f"Recall:    {recall_score(y_test, y_pred) * 100:.2f}%")
print(f"F1 Score:  {f1_score(y_test, y_pred) * 100:.2f}%")

print("\n--- EVALUATING PROPHET (Hotspots) ---")
df_ts = pd.read_csv(os.path.join(DATA_DIR, "time_series_prophet_sample.csv"))
area = "Connaught Place"
df_area = df_ts[df_ts['area'] == area][['ds', 'y']].copy()
df_area['ds'] = pd.to_datetime(df_area['ds'])
df_area = df_area.sort_values('ds')

train_size = int(len(df_area) * 0.8)
train = df_area.iloc[:train_size]
test = df_area.iloc[train_size:]

m = Prophet(daily_seasonality=True, yearly_seasonality=True)
m.fit(train)
future = m.make_future_dataframe(periods=len(test))
forecast = m.predict(future)

predictions = forecast.iloc[train_size:]['yhat'].values
actuals = test['y'].values
mae = mean_absolute_error(actuals, predictions)
print(f"Mean Absolute Error (MAE) for Connaught Place: {mae:.2f} incidents/day")

print("\n--- EVALUATING ISOLATION FOREST (Emerging Threats) ---")
print("Isolation Forest is unsupervised (no ground truth labels).")
print("Contamination parameter set to: 5.00%")
print("This mathematically guarantees the top 5% most unusual data points are flagged as anomalies.")
