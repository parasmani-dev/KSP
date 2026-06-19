import os
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "Dataset")

print("Testing XGBoost Enhancements...\n")

df_offenders = pd.read_csv(os.path.join(DATA_DIR, "repeat_offenders.csv"))

# 1. Feature Engineering: Add Categorical Features
le_crime = LabelEncoder()
df_offenders['primary_crime_type_encoded'] = le_crime.fit_transform(df_offenders['primary_crime_type'])

le_area = LabelEncoder()
df_offenders['area_encoded'] = le_area.fit_transform(df_offenders['area'])

features_xgb = ['prior_crime_count', 'days_since_last_crime', 'network_connections', 'escalation_score', 'primary_crime_type_encoded', 'area_encoded']
X_xgb = df_offenders[features_xgb]
y_xgb = df_offenders['reoffended']

X_train, X_test, y_train, y_test = train_test_split(X_xgb, y_xgb, test_size=0.2, random_state=42)

# 2. Hyperparameter Tuning using GridSearchCV
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.05, 0.1],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0]
}

print("Running Grid Search to find the absolute best parameters...")
xgb_base = xgb.XGBClassifier(random_state=42)
grid_search = GridSearchCV(estimator=xgb_base, param_grid=param_grid, cv=3, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)

print(f"\nBest Parameters Found: {grid_search.best_params_}")
print(f"  New Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"  New Precision: {precision_score(y_test, y_pred, zero_division=0) * 100:.2f}%")
print(f"  New Recall:    {recall_score(y_test, y_pred, zero_division=0) * 100:.2f}%")
