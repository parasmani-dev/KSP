import pandas as pd
import os

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'Dataset')

def get_hotspots():
    crime_records_path = os.path.join(DATASET_DIR, 'crime_records.csv')
    try:
        df = pd.read_csv(crime_records_path)
    except FileNotFoundError:
        return []
        
    if 'area' not in df.columns:
        return []
        
    hotspots = df.groupby('area').size().reset_index(name='crime_count')
    hotspots = hotspots.sort_values(by='crime_count', ascending=False)
    
    if 'lat' in df.columns and 'long' in df.columns:
        coords = df.groupby('area')[['lat', 'long']].mean().reset_index()
        hotspots = pd.merge(hotspots, coords, on='area')
        
    return hotspots.to_dict(orient='records')
