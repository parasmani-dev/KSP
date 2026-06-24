import networkx as nx

def get_top_centrality(graph: nx.Graph, top_n: int = 10):
    # Filter only Citizen nodes for centrality
    citizen_nodes = [n for n, attr in graph.nodes(data=True) if attr.get('type') == 'Citizen']
    subgraph = graph.subgraph(citizen_nodes)
    
    if len(subgraph) == 0:
        return {"degree": [], "betweenness": []}
        
    degree_cent = nx.degree_centrality(subgraph)
    betweenness_cent = nx.betweenness_centrality(subgraph)
    
    top_degree = sorted(degree_cent.items(), key=lambda x: x[1], reverse=True)[:top_n]
    top_betweenness = sorted(betweenness_cent.items(), key=lambda x: x[1], reverse=True)[:top_n]
    
    return {
        "degree": [{"node": node, "score": score, "links": graph.degree(node)} for node, score in top_degree],
        "betweenness": [{"node": node, "score": score} for node, score in top_betweenness]
    }
