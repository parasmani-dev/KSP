import torch
from torch_geometric.data import Data
import networkx as nx

def prep_graph_data(nx_graph: nx.Graph):
    node_mapping = {node: i for i, node in enumerate(nx_graph.nodes())}
    reverse_mapping = {i: node for node, i in node_mapping.items()}
    
    edge_index = []
    for u, v in nx_graph.edges():
        edge_index.append([node_mapping[u], node_mapping[v]])
        edge_index.append([node_mapping[v], node_mapping[u]])
        
    edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
    
    degrees = dict(nx.degree(nx_graph))
    types = [attr.get('type', 'Unknown') for n, attr in nx_graph.nodes(data=True)]
    unique_types = sorted(list(set(types)))
    type_to_idx = {t: i for i, t in enumerate(unique_types)}
    
    import math
    x_features = []
    for node in nx_graph.nodes():
        node_type = nx_graph.nodes[node].get('type', 'Unknown')
        deg = degrees[node]
        
        feat = [0.0] # math.log(deg + 1.0)
        one_hot = [0.0] * len(unique_types)
        one_hot[type_to_idx[node_type]] = 1.0
        feat.extend(one_hot)
        
        x_features.append(feat)
        
    x = torch.tensor(x_features, dtype=torch.float)
    
    data = Data(x=x, edge_index=edge_index)
    return data, node_mapping, reverse_mapping
