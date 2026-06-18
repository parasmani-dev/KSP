import pandas as pd
import networkx as nx

def link_case_entities(graph: nx.Graph, mock_df: pd.DataFrame):
    """
    Extracts case-linking logic to ensure Case is a first-class node 
    explicitly linked to citizens and organizations tied to it.
    """
    for _, row in mock_df.iterrows():
        case_id = row.get('case_id')
        primary_suspect = row.get('primary_suspect')
        suspects_str = row.get('suspects')
        network_id = row.get('network_id')
        network_members_str = row.get('network_members')
        
        if pd.isna(case_id):
            continue
            
        if not graph.has_node(case_id):
            graph.add_node(case_id, type='Case')
            
        suspects = []
        if pd.notna(suspects_str):
            suspects = [s.strip() for s in suspects_str.split(';')]
            
        for suspect in suspects:
            if not graph.has_node(suspect):
                graph.add_node(suspect, type='Citizen')
            graph.add_edge(suspect, case_id, relationship='INVOLVED_IN')
                
        members = []
        if pd.notna(network_members_str):
            members = [m.strip() for m in network_members_str.split(';')]
            
        for member in members:
            if not graph.has_node(member):
                graph.add_node(member, type='Citizen')
            if pd.notna(network_id):
                if not graph.has_node(network_id):
                    graph.add_node(network_id, type='Organization')
                graph.add_edge(member, network_id, relationship='PART_OF')
                graph.add_edge(network_id, case_id, relationship='TIED_TO_CASE')
                
        if pd.notna(primary_suspect):
            if not graph.has_node(primary_suspect):
                graph.add_node(primary_suspect, type='Citizen')
            
            graph.add_edge(primary_suspect, case_id, relationship='PRIMARY_SUSPECT_OF')

            for suspect in suspects:
                if suspect != primary_suspect:
                    graph.add_edge(primary_suspect, suspect, relationship='ASSOCIATED_WITH')
                    
            for member in members:
                if member != primary_suspect:
                    graph.add_edge(primary_suspect, member, relationship='ASSOCIATED_WITH')

    return graph
