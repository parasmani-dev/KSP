import pandas as pd
import networkx as nx
import os

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
        
    # Process Crime Records -> Adds Crime Nodes and Location associations
    for _, row in crime_df.iterrows():
        fir_id = row.get('fir_id')
        crime_type = row.get('crime_type')
        area = row.get('area')
        
        if pd.notna(fir_id):
            G.add_node(fir_id, type='Crime', crime_type=crime_type, area=area)
            if pd.notna(area):
                # Ensure Area node exists
                if not G.has_node(area):
                    G.add_node(area, type='Location')
                G.add_edge(fir_id, area, relationship='OCCURRED_AT')

    # Process Mock Graph -> Adds Suspect Nodes, Networks, and Relationships
    for _, row in mock_df.iterrows():
        case_id = row.get('case_id')
        primary_suspect = row.get('primary_suspect')
        suspects_str = row.get('suspects')
        network_id = row.get('network_id')
        network_members_str = row.get('network_members')
        
        # Link case to suspects
        suspects = []
        if pd.notna(suspects_str):
            suspects = [s.strip() for s in suspects_str.split(';')]
            
        for suspect in suspects:
            if not G.has_node(suspect):
                G.add_node(suspect, type='Citizen')
            if pd.notna(case_id):
                G.add_edge(suspect, case_id, relationship='INVOLVED_IN')
                
        # Link network members
        members = []
        if pd.notna(network_members_str):
            members = [m.strip() for m in network_members_str.split(';')]
            
        for member in members:
            if not G.has_node(member):
                G.add_node(member, type='Citizen')
            if pd.notna(network_id):
                if not G.has_node(network_id):
                    G.add_node(network_id, type='Organization')
                G.add_edge(member, network_id, relationship='PART_OF')
                
        # Add primary suspect relationships
        if pd.notna(primary_suspect):
            if not G.has_node(primary_suspect):
                G.add_node(primary_suspect, type='Citizen')
            for suspect in suspects:
                if suspect != primary_suspect:
                    G.add_edge(primary_suspect, suspect, relationship='ASSOCIATED_WITH')
                    
            for member in members:
                if member != primary_suspect:
                    G.add_edge(primary_suspect, member, relationship='ASSOCIATED_WITH')

    return G

# Singleton graph instance for the API to use
GRAPH = build_graph()
