import pandas as pd
import random
import os
import hashlib

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'Dataset')

def generate_datasets():
    print(f"Ensuring output directory exists: {DATASET_DIR}")
    
    # Load original datasets
    mock_df = pd.read_csv(os.path.join(DATASET_DIR, 'mock_graph_sample.csv'))
    crime_df = pd.read_csv(os.path.join(DATASET_DIR, 'crime_records_sample.csv'))
    
    entities = []
    seen = set()
    
    def add_entity(e_id, e_type):
        if pd.isna(e_id) or str(e_id).strip() == '': return
        e_id = str(e_id).strip()
        if e_id in seen: return
        seen.add(e_id)
        
        seed = int(hashlib.sha256(e_id.encode()).hexdigest(), 16) % (10**8)
        random.seed(seed)
        
        row = {'entity_id': e_id, 'entity_type': e_type}
        
        if e_type == 'Citizen':
            row['age'] = random.randint(18, 65)
            row['gender'] = random.choice(['Male', 'Male', 'Male', 'Female'])
            row['phone'] = f"+91 {random.randint(7000000000, 9999999999)}"
            row['status'] = random.choice(['Active', 'Under Surveillance', 'Absconding', 'Arrested'])
        elif e_type == 'Organization':
            row['threat_level'] = random.choice(['High', 'Severe', 'Moderate'])
            row['known_territory'] = random.choice(['Secunderabad', 'Madhapur', 'Charminar', 'Borivali'])
        elif e_type == 'Vehicle':
            row['make_model'] = random.choice(['Toyota Innova', 'Maruti Swift', 'Honda City', 'Bajaj Pulsar'])
            row['color'] = random.choice(['White', 'Black', 'Silver', 'Red'])
            
        entities.append(row)

    # Extract all entities from mock_graph
    for _, row in mock_df.iterrows():
        add_entity(row.get('primary_suspect'), 'Citizen')
        
        suspects = row.get('suspects')
        if pd.notna(suspects):
            for s in str(suspects).split(';'):
                add_entity(s, 'Citizen')
                
        members = row.get('network_members')
        if pd.notna(members):
            for m in str(members).split(';'):
                add_entity(m, 'Citizen')
                
        add_entity(row.get('network_id'), 'Organization')

    # Save entities_sample.csv
    entities_df = pd.DataFrame(entities)
    entities_df.to_csv(os.path.join(DATASET_DIR, 'entities_sample.csv'), index=False)
    print(f"Generated entities_sample.csv with {len(entities_df)} records.")
    
    # Enrich crime_records_sample.csv with case_status and io_name
    # Assuming 'case_id' matches 'incident_id' or we can randomly assign. 
    # For now, we'll just add random case_status to crime_records_sample
    statuses = ['Open', 'Closed', 'Under Investigation', 'Chargesheet Filed']
    io_names = [f"Inspector {i}" for i in range(1, 10)]
    
    if 'case_status' not in crime_df.columns:
        crime_df['case_status'] = [random.choice(statuses) for _ in range(len(crime_df))]
    if 'io_name' not in crime_df.columns:
        crime_df['io_name'] = [random.choice(io_names) for _ in range(len(crime_df))]
        
    crime_df.to_csv(os.path.join(DATASET_DIR, 'crime_records_sample.csv'), index=False)
    print(f"Enriched crime_records_sample.csv.")

if __name__ == "__main__":
    generate_datasets()
