import pandas as pd
import random
import uuid
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "Dataset")

# We will use all unique areas from crime_records
df_crimes = pd.read_csv(os.path.join(DATA_DIR, "crime_records.csv"))
df_ts = pd.read_csv(os.path.join(DATA_DIR, "time_series_prophet.csv"))
areas = list(set(df_crimes['area'].unique().tolist() + df_ts['area'].unique().tolist()))

print(f"Generating data for {len(areas)} areas.")

# Generate CCTV Cameras
cctv_records = []
for i in range(1000):  # 1000 cameras total
    area = random.choice(areas)
    
    # Base coords near 12.9, 77.5 for simplicity, we add variance
    seed = hash(area) % 10000
    lat_base = 12.9 + (seed / 100000.0) - 0.05
    lon_base = 77.5 + (seed / 100000.0) - 0.05
    
    lat = lat_base + (random.random() * 0.02 - 0.01)
    lon = lon_base + (random.random() * 0.02 - 0.01)
    
    cctv_records.append({
        "camera_id": str(uuid.uuid4()),
        "area": area,
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "coverage_radius_m": random.choice([100, 150, 200, 250]),
        "status": random.choice(["active", "active", "active", "maintenance"]),
        "location_description": f"Intersection {random.randint(1, 99)}, {area}"
    })

df_cctv = pd.DataFrame(cctv_records)
df_cctv.to_csv(os.path.join(DATA_DIR, "cctv_cameras.csv"), index=False)
print("Generated cctv_cameras.csv")


# Generate Repeat Offenders
offender_records = []
crime_types = df_crimes['crime_type'].unique().tolist() if 'crime_type' in df_crimes.columns else ["Theft", "Assault", "Robbery"]

for i in range(500):
    area = random.choice(areas)
    offender_records.append({
        "offender_id": f"OFF-{random.randint(1000, 9999)}",
        "name": f"Suspect {i+1}",
        "area": area,
        "primary_crime_type": random.choice(crime_types),
        "prior_crime_count": random.randint(2, 15),
        "days_since_last_crime": random.randint(5, 300),
        "network_connections": random.randint(0, 5),
        "escalation_score": round(random.random(), 2),
        "reoffended": random.choice([0, 1])
    })

df_offenders = pd.DataFrame(offender_records)
df_offenders.to_csv(os.path.join(DATA_DIR, "repeat_offenders.csv"), index=False)
print("Generated repeat_offenders.csv")
