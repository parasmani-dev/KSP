# Graph service

The FastAPI app in `api/main.py` serves relationship and graph analysis built from the tracked synthetic sample CSVs. `graph/` builds the NetworkX graph, `analysis/` contains its queries, and `prediction/` holds research code.

The public demo uses the NetworkX baseline. Saved GNN weights are local generated artifacts and are excluded from Git and Docker. The GNN inference path is disabled in the deployed API.

See the root [README](../README.md) for local startup, screenshots, and deployment.
