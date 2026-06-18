import networkx as nx
import community as community_louvain

def detect_communities(graph: nx.Graph):
    valid_types = {'Citizen', 'Organization'}
    nodes_of_interest = [n for n, attr in graph.nodes(data=True) if attr.get('type') in valid_types]
    subgraph = graph.subgraph(nodes_of_interest)
    
    if len(subgraph) == 0:
        return {}
        
    partition = community_louvain.best_partition(subgraph)
    
    communities = {}
    for node, comm_id in partition.items():
        if comm_id not in communities:
            communities[comm_id] = []
        communities[comm_id].append(node)
        
    return communities
