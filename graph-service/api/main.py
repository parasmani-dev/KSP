from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx

import sys
import os

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from graph.graph_builder import GRAPH
from analysis.centrality import get_top_centrality
from analysis.communities import detect_communities
from analysis.hotspots import get_hotspots
from prediction.link_prediction_baseline import predict_hidden_links, predict_accomplices

app = FastAPI(title="Graph API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/graph/network")
def get_network():
    """Get full graph network in node-link JSON format."""
    data = nx.node_link_data(GRAPH)
    return {"network": data}

@app.get("/graph/case/{case_id}")
def get_case_subgraph(case_id: str):
    """Get subgraph for a specific case (FIR)."""
    if not GRAPH.has_node(case_id):
        raise HTTPException(status_code=404, detail="Case not found")
        
    neighbors = list(GRAPH.neighbors(case_id))
    nodes = [case_id] + neighbors
    subgraph = GRAPH.subgraph(nodes)
    return {"network": nx.node_link_data(subgraph)}

@app.get("/graph/centrality")
def get_centrality():
    """Get ranked list of most influential entities."""
    return get_top_centrality(GRAPH)

@app.get("/graph/communities")
def get_communities():
    """Get detected gangs/groups."""
    return {"communities": detect_communities(GRAPH)}

@app.get("/graph/search")
def search_node(name: str):
    """Node lookup by name, returns associated nodes/edges."""
    matches = [n for n in GRAPH.nodes() if str(n).lower() == name.lower()]
    if not matches:
        return {"network": {"nodes": [], "links": []}}
        
    neighborhood = set(matches)
    for match in matches:
        neighborhood.update(GRAPH.neighbors(match))
        
    subgraph = GRAPH.subgraph(neighborhood)
    return {"network": nx.node_link_data(subgraph)}

@app.get("/graph/hotspots")
def get_hotspots_api():
    """Area-wise crime counts."""
    return {"hotspots": get_hotspots()}

from prediction.gnn_inference import predict_links_gnn, predict_clusters_gnn

@app.get("/predict/links")
def predict_links_api():
    """Predict hidden connections."""
    # GNN disabled due to schema leakage in validation; classical baseline ships for demo
    return {"predictions": predict_hidden_links(GRAPH), "status": "baseline"}

@app.get("/predict/accomplices/{citizen_id}")
def predict_accomplices_api(citizen_id: str):
    """Predict hidden accomplices for a given citizen."""
    return {"predictions": predict_accomplices(GRAPH, citizen_id), "status": "baseline"}

@app.get("/predict/clusters")
def predict_clusters_api():
    """Crime cluster groupings."""
    # GNN disabled due to schema leakage in validation; classical baseline ships for demo
    return {"clusters": detect_communities(GRAPH), "status": "baseline"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
