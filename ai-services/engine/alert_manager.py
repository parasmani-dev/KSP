import os
import pandas as pd
from datetime import datetime, timedelta

class AlertManager:
    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.config_path = os.path.join(BASE_DIR, "Dataset", "alert_thresholds_config_sample.csv")
        self.history_path = os.path.join(BASE_DIR, "Dataset", "alert_history_sample.csv")
        
        self.config_df = pd.DataFrame()
        self.history = {} # in-memory history: (crime_type, area) -> datetime of last alert
        
        self._load_config()
        self._load_history()

    def _load_config(self):
        if os.path.exists(self.config_path):
            self.config_df = pd.read_csv(self.config_path)
            # Ensure it's active
            self.config_df = self.config_df[self.config_df['active'] == 1]
        else:
            print(f"Warning: Alert config not found at {self.config_path}")

    def _load_history(self):
        # We will mock the load to start fresh in memory for the demo
        self.history = {}

    def process_event(self, area: str, crime_type: str, risk_score: float):
        """
        Evaluates a live prediction event against the threshold configuration.
        Returns an alert dict if threshold is crossed AND cooldown is respected.
        """
        if self.config_df.empty:
            return None
            
        # 1. Lookup specific config
        match = self.config_df[(self.config_df['area'] == area) & (self.config_df['crime_type'] == crime_type)]
        
        if match.empty:
            # Fallback default if not found
            threshold = 0.85
            cooldown = 30
            severity = "HIGH"
        else:
            row = match.iloc[0]
            threshold = float(row['risk_threshold'])
            cooldown = int(row['cooldown_minutes'])
            severity = row['alert_type']
            
        # 2. Check Threshold
        if risk_score >= threshold:
            # 3. Check Cooldown
            now = datetime.now()
            last_alert_time = self.history.get((crime_type, area))
            
            if last_alert_time is None or (now - last_alert_time) > timedelta(minutes=cooldown):
                # 4. Fire Alert
                self.history[(crime_type, area)] = now
                
                return {
                    "timestamp": now.isoformat(),
                    "area": area,
                    "crime_type": crime_type,
                    "trigger_type": "EMERGENCY_SPIKE",
                    "severity": severity,
                    "message": f"Risk score {risk_score:.2f} exceeded threshold {threshold} for {crime_type} in {area}."
                }
                
        return None

# Singleton instance
alert_engine = AlertManager()
