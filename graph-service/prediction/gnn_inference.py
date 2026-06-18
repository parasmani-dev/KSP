import torch
import networkx as nx
from sklearn.cluster import KMeans
import os

from prediction.gnn_prep import prep_graph_data
from prediction.gnn_model import GraphSAGE

def get_gnn_embeddings(nx_graph: nx.Graph, weights_path="model_weights.pt"):
    """Loads trained GNN and returns node embeddings + mapping."""
    if not os.path.exists(weights_path):
        return None, None, None
        
    data, node_mapping, reverse_mapping = prep_graph_data(nx_graph)
    
    model = GraphSAGE(in_channels=data.x.size(1), hidden_channels=32, out_channels=16)
    model.load_state_dict(torch.load(weights_path, weights_only=True))
    model.eval()
    
    with torch.no_grad():
        z = model.encode(data.x, data.edge_index)
        
    return z, node_mapping, reverse_mapping

def predict_links_gnn(nx_graph: nx.Graph, top_n: int = 20, weights_path="model_weights.pt"):
    z, node_mapping, reverse_mapping = get_gnn_embeddings(nx_graph, weights_path)
    if z is None:
        return None
        
    citizen_nodes = [n for n, attr in nx_graph.nodes(data=True) if attr.get('type') == 'Citizen']
    citizen_indices = [node_mapping[n] for n in citizen_nodes]
    
    import itertools
    pairs = list(itertools.combinations(citizen_indices, 2))
    if not pairs:
        return []
        
    edge_label_index = torch.tensor(pairs, dtype=torch.long).t().contiguous()
    
    data, _, _ = prep_graph_data(nx_graph)
    model = GraphSAGE(in_channels=data.x.size(1), hidden_channels=32, out_channels=16)
    model.load_state_dict(torch.load(weights_path, weights_only=True))
    model.eval()
    
    with torch.no_grad():
        scores = model.decode(z, edge_label_index).sigmoid().numpy()
        
    sorted_indices = scores.argsort()[::-1]
    
    results = []
    for idx in sorted_indices:
        u_idx = pairs[idx][0]
        v_idx = pairs[idx][1]
        
        u = reverse_mapping[u_idx]
        v = reverse_mapping[v_idx]
        score = float(scores[idx])
        
        if not nx_graph.has_edge(u, v):
            results.append({
                "source": u,
                "target": v,
                "confidence_score": score,
                "method": "graphsage_gnn_mlp"
            })
            if len(results) >= top_n:
                break
                
    return results

def predict_clusters_gnn(nx_graph: nx.Graph, n_clusters: int = 5, weights_path="model_weights.pt"):
    z, node_mapping, reverse_mapping = get_gnn_embeddings(nx_graph, weights_path)
    if z is None:
        return None
        
    valid_types = {'Citizen', 'Organization'}
    nodes_of_interest = [n for n, attr in nx_graph.nodes(data=True) if attr.get('type') in valid_types]
    indices = [node_mapping[n] for n in nodes_of_interest]
    
    z_subset = z[indices].numpy()
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(z_subset)
    
    clusters = {}
    for idx, label in enumerate(labels):
        comm_id = int(label)
        if comm_id not in clusters:
            clusters[comm_id] = []
        clusters[comm_id].append(reverse_mapping[indices[idx]])
        
    return clusters
