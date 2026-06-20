import networkx as nx

def explain_node(graph: nx.Graph, node_id: str):
    if not graph.has_node(node_id):
        return {"explanation": "Node not found in graph."}
        
    node_data = graph.nodes[node_id]
    node_type = node_data.get('type', 'Unknown')
    
    neighbors = list(graph.neighbors(node_id))
    
    if len(neighbors) == 0:
        return {"explanation": f"No recorded connections found for this {node_type}."}
        
    explanation_lines = []
    
    # Safely extract all properties dynamically
    import pandas as pd
    
    # [WARNING: SCHEMA DISCREPANCY]
    # The underlying entities.csv uses 'threat_level', but the frontend expects 'risk_score'.
    # This runtime translation is a band-aid. The CSV schema should eventually be fixed.
    if 'threat_level' in node_data:
        node_data['risk_score'] = node_data.pop('threat_level')
        
    props = [f"{k.replace('_', ' ').title()}: {v}" for k, v in node_data.items() if k not in ['id', 'type', 'name', 'investigating_officer'] and pd.notna(v)]
    props_str = f" Known attributes: {', '.join(props)}." if props else ""
    
    explanation_lines.append(f"This node represents {node_id}, classified as a {node_type}.{props_str}")
    
    if node_type == 'Citizen':
        cases = []
        orgs = []
        associates = []
        
        for n in neighbors:
            edge_data = graph.get_edge_data(node_id, n)
            rel = edge_data.get('relationship', 'CONNECTED_TO')
            n_type = graph.nodes[n].get('type', 'Unknown')
            
            if n_type == 'Case':
                cases.append(f"{n} (Role: {rel.replace('_', ' ').title()})")
            elif n_type == 'Organization':
                orgs.append(f"{n}")
            elif n_type == 'Citizen':
                associates.append(f"{n} ({rel.replace('_', ' ').title()})")
                
        if cases:
            explanation_lines.append(f"They are linked to {len(cases)} case(s): {', '.join(cases)}.")
        if orgs:
            explanation_lines.append(f"They are part of the following organization(s): {', '.join(orgs)}.")
        if associates:
            explanation_lines.append(f"They are known to associate with {len(associates)} other citizen(s): {', '.join(associates[:5])}{'...' if len(associates)>5 else ''}.")
            
    elif node_type == 'Case':
        suspects = []
        locations = []
        orgs = []
        
        for n in neighbors:
            edge_data = graph.get_edge_data(node_id, n)
            rel = edge_data.get('relationship', 'CONNECTED_TO')
            n_type = graph.nodes[n].get('type', 'Unknown')
            
            if n_type == 'Citizen':
                suspects.append(f"{n} ({rel.replace('_', ' ').title()})")
            elif n_type == 'Location':
                locations.append(f"{n}")
            elif n_type == 'Organization':
                orgs.append(f"{n}")
                
        if suspects:
            explanation_lines.append(f"This case involves {len(suspects)} individual(s): {', '.join(suspects)}.")
        if locations:
            explanation_lines.append(f"The incident occurred at: {', '.join(locations)}.")
        if orgs:
            explanation_lines.append(f"It is tied to organization(s): {', '.join(orgs)}.")
            
    else:
        # Generic fallback for Vehicle, Location, Organization, or missing types
        connections = []
        for n in neighbors[:5]: # Limit to 5 for brevity
            edge_data = graph.get_edge_data(node_id, n)
            rel = edge_data.get('relationship', 'CONNECTED_TO')
            n_type = graph.nodes[n].get('type', 'Unknown')
            connections.append(f"{n} ({n_type}, via {rel.replace('_', ' ').title()})")
            
        explanation_lines.append(f"This {node_type} is connected to {len(neighbors)} entities in total.")
        if connections:
            more = "..." if len(neighbors) > 5 else ""
            explanation_lines.append(f"Sample connections include: {', '.join(connections)}{more}.")

    return {"explanation": " ".join(explanation_lines)}
