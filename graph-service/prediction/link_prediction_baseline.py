import networkx as nx

def predict_hidden_links(graph: nx.Graph, top_n: int = 20):
    """
    Uses classical Jaccard Coefficient to predict likely hidden connections 
    between Citizen nodes that are not currently connected.
    """
    citizen_nodes = [n for n, attr in graph.nodes(data=True) if attr.get('type') == 'Citizen']
    subgraph = graph.subgraph(citizen_nodes)
    
    undirected_sub = subgraph.to_undirected()
    
    try:
        preds = nx.jaccard_coefficient(undirected_sub)
    except nx.NetworkXNotImplemented:
        return []

    sorted_preds = sorted(preds, key=lambda x: x[2], reverse=True)
    
    results = []
    for u, v, p in sorted_preds[:top_n]:
        if p > 0 and not graph.has_edge(u, v):
            results.append({
                "source": u,
                "target": v,
                "confidence_score": p,
                "method": "jaccard_coefficient"
            })
            
    return results

def predict_accomplices(graph: nx.Graph, citizen_id: str, top_n: int = 5):
    """
    Finds likely accomplices for a specific citizen using Adamic-Adar index.
    """
    if not graph.has_node(citizen_id):
        return []
        
    citizen_nodes = [n for n, attr in graph.nodes(data=True) if attr.get('type') == 'Citizen']
    subgraph = graph.subgraph(citizen_nodes).to_undirected()
    
    pairs = [(citizen_id, other) for other in citizen_nodes if other != citizen_id and not graph.has_edge(citizen_id, other)]
    
    try:
        preds = nx.adamic_adar_index(subgraph, pairs)
    except Exception:
        preds = nx.jaccard_coefficient(subgraph, pairs)
        
    sorted_preds = sorted(preds, key=lambda x: x[2], reverse=True)
    
    results = []
    for u, v, p in sorted_preds[:top_n]:
        if p > 0:
            target = v if u == citizen_id else u
            results.append({
                "accomplice": target,
                "confidence_score": p,
                "method": "adamic_adar"
            })
            
    return results
