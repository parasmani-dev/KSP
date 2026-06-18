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
        
        if pd.notna(fir_id):
            G.add_node(fir_id, type='Case', crime_type=crime_type, area=area)
            if pd.notna(area):
                # Ensure Area node exists
                if not G.has_node(area):
                    G.add_node(area, type='Location')
                G.add_edge(fir_id, area, relationship='OCCURRED_AT')

    # Process Mock Graph -> Delegates case-linking logic
    G = link_case_entities(G, mock_df)

    return G

# Singleton graph instance for the API to use
GRAPH = build_graph()
