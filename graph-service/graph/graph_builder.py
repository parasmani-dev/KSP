import pandas as pd
import networkx as nx
import os
import random
import hashlib

from analysis.case_linking import link_case_entities

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'Dataset')

def enrich_mock_data(G):
    """Adds realistic fake attributes to nodes for the UI demo based on their type."""
    for node, data in G.nodes(data=True):
        node_type = data.get('type')
        
        # Seed random generator with node ID so attributes are consistent across reloads
        seed = int(hashlib.sha256(str(node).encode()).hexdigest(), 16) % (10**8)
        random.seed(seed)
        
        if node_type == 'Citizen':
            G.nodes[node]['age'] = random.randint(18, 65)
            G.nodes[node]['gender'] = random.choice(['Male', 'Male', 'Male', 'Female'])
            G.nodes[node]['risk_level'] = random.choice(['Low', 'Medium', 'High', 'Critical'])
            G.nodes[node]['phone'] = f"+91 {random.randint(7000000000, 9999999999)}"
            G.nodes[node]['status'] = random.choice(['Active', 'Under Surveillance', 'Absconding', 'Arrested'])
            
        elif node_type == 'Organization':
            G.nodes[node]['threat_level'] = random.choice(['High', 'Severe', 'Moderate'])
            G.nodes[node]['member_count_est'] = random.randint(5, 50)
            
        elif node_type == 'Location':
            G.nodes[node]['patrol_zone'] = random.choice(['Zone A', 'Zone B', 'Zone C'])
            G.nodes[node]['risk_score'] = round(random.uniform(0.1, 0.9), 2)
            
        elif node_type == 'Case':
            G.nodes[node]['status'] = random.choice(['Open', 'Closed', 'Cold Case', 'Under Investigation'])
            G.nodes[node]['investigating_officer'] = random.choice(['Insp. Reddy', 'Insp. Sharma', 'Insp. Kumar', 'Sub-Insp. Patel'])
            
        elif node_type == 'Vehicle':
            G.nodes[node]['make'] = random.choice(['Toyota', 'Maruti Suzuki', 'Honda', 'Hyundai', 'Bajaj', 'Royal Enfield'])
            G.nodes[node]['color'] = random.choice(['White', 'Black', 'Silver', 'Red'])
            
    return G

def build_graph():
    """Builds and returns a NetworkX graph from the dataset files."""
    G = nx.Graph()
    
    mock_graph_path = os.path.join(DATASET_DIR, 'mock_graph.csv')
    crime_records_path = os.path.join(DATASET_DIR, 'crime_records.csv')
    
    # Load data
    try:
        mock_df = pd.read_csv(mock_graph_path)
        crime_df = pd.read_csv(crime_records_path)
    except FileNotFoundError as e:
        print(f"Dataset not found: {e}")
        return G
        
    # Process Crime Records -> Adds Case Nodes and Location associations
    for _, row in crime_df.iterrows():
        fir_id = row.get('fir_id')
        crime_type = row.get('crime_type')
        area = row.get('area')
        
        if pd.notna(fir_id):
            G.add_node(fir_id, type='Case', crime_type=crime_type, area=area)
            if pd.notna(area):
                # Ensure Area node exists
                if not G.has_node(area):
                    G.add_node(area, type='Location')
                G.add_edge(fir_id, area, relationship='OCCURRED_AT')

    # Process Mock Graph -> Delegates case-linking logic
    G = link_case_entities(G, mock_df)
    
    # Enrich with fake data for the demo UI
    G = enrich_mock_data(G)

    return G

# Singleton graph instance for the API to use
GRAPH = build_graph()
