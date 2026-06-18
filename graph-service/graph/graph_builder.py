import pandas as pd
import networkx as nx
import os

from analysis.case_linking import link_case_entities

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'Dataset')

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
        
        # Read new attributes from enriched crime_records.csv
        case_status = row.get('case_status')
        io_name = row.get('io_name')
        
        if pd.notna(fir_id):
            G.add_node(fir_id, type='Case', crime_type=crime_type, area=area, status=case_status, investigating_officer=io_name)
            if pd.notna(area):
                # Ensure Area node exists
                if not G.has_node(area):
                    G.add_node(area, type='Location')
                G.add_edge(fir_id, area, relationship='OCCURRED_AT')

    # Process Mock Graph -> Delegates case-linking logic
    G = link_case_entities(G, mock_df)
    
    # Load Real Entity Attributes from entities.csv
    try:
        entities_path = os.path.join(DATASET_DIR, 'entities.csv')
        entities_df = pd.read_csv(entities_path)
        for _, row in entities_df.iterrows():
            e_id = row['entity_id']
            if G.has_node(e_id):
                for col in entities_df.columns:
                    if col not in ['entity_id', 'entity_type'] and pd.notna(row[col]):
                        G.nodes[e_id][col] = row[col]
    except FileNotFoundError:
        print("entities.csv not found. Entity attributes will be barebones.")
        pass

    return G

# Singleton graph instance for the API to use
GRAPH = build_graph()
