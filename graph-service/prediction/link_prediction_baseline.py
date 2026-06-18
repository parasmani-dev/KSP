import networkx as nx
import itertools

def _get_explanation(graph: nx.Graph, u: str, v: str):
    """Generates an explanation by finding common neighbors in the full graph."""
    common = list(nx.common_neighbors(graph, u, v))
    if not common:
        return {"shared_connections": [], "reason": "No direct common neighbors found."}
        
    details = []
    for node in common:
        node_type = graph.nodes[node].get('type', 'Unknown')
        details.append(f"{node} ({node_type})")
        
    return {
        "shared_connections": details,
        "reason": f"Shared {len(details)} connections: {', '.join(details)}"
    }

def predict_hidden_links(graph: nx.Graph, top_n: int = 20):
    """
    Uses classical Jaccard Coefficient to predict likely hidden connections 
    between Citizen nodes, factoring in all node types (Cases, Orgs) as shared neighbors.
    """
    undirected_graph = graph.to_undirected()
    
    citizen_nodes = [n for n, attr in graph.nodes(data=True) if attr.get('type') == 'Citizen']
    
    # Generate all possible pairs of citizens that are not currently connected
    pairs = []
    for u, v in itertools.combinations(citizen_nodes, 2):
        if not undirected_graph.has_edge(u, v):
            pairs.append((u, v))
            
    try:
        preds = nx.jaccard_coefficient(undirected_graph, pairs)
    except nx.NetworkXNotImplemented:
        return []

    sorted_preds = sorted(preds, key=lambda x: x[2], reverse=True)
    
    results = []
    for u, v, p in sorted_preds[:top_n]:
        if p > 0:
            results.append({
                "source": u,
                "target": v,
                "confidence_score": p,
                "method": "jaccard_coefficient",
                "explanation": _get_explanation(undirected_graph, u, v)
            })
            
    return results

def predict_accomplices(graph: nx.Graph, citizen_id: str, top_n: int = 5):
    """
    Finds likely accomplices for a specific citizen using Adamic-Adar index,
    which heavily weights shared connections that are rare (like a specific case).
    """
    if not graph.has_node(citizen_id):
        return []
        
    undirected_graph = graph.to_undirected()
    citizen_nodes = [n for n, attr in graph.nodes(data=True) if attr.get('type') == 'Citizen']
    
    pairs = [(citizen_id, other) for other in citizen_nodes if other != citizen_id and not undirected_graph.has_edge(citizen_id, other)]
    
    try:
        preds = nx.adamic_adar_index(undirected_graph, pairs)
    except Exception:
        preds = nx.jaccard_coefficient(undirected_graph, pairs)
        
    sorted_preds = sorted(preds, key=lambda x: x[2], reverse=True)
    
    results = []
    for u, v, p in sorted_preds[:top_n]:
        if p > 0:
            target = v if u == citizen_id else u
            results.append({
                "accomplice": target,
                "confidence_score": p,
                "method": "adamic_adar" if "adamic" in str(preds) else "jaccard_coefficient",
                "explanation": _get_explanation(undirected_graph, u, v)
            })
            
    return results
