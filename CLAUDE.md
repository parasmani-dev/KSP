# CLAUDE.md — Graph Analytics & Neural Intelligence Module (graph-service)

> INTERNAL WORKING FILE — for agent context only. Do NOT commit this file to the shared repo.
> Add `CLAUDE.md` to `.gitignore` in this folder before pushing anything, so it never gets tracked by accident.

This file is the context for any AI agent working inside this folder. Read this fully before writing or editing anything.

## Project: Crime Intelligence Operating System (CIOS)

One-line: an AI platform that turns fragmented crime data (FIRs, citizen records, locations, evidence) into actionable investigation intelligence — prediction, criminal network graphs, multi-agent investigation, citizen risk scoring, and a Kannada-language copilot. Hackathon-scale project, 4-person team, one monorepo, one folder per owner. Frontend developer is not on the project yet (joining in ~2 days) — do not wait on them for anything inside this module.

## Your scope: `graph-service/` ONLY

- Edit only inside `graph-service/`.
- Never modify `frontend/`, `backend/`, or `ai-services/`.
- Treat `contracts/` as read-only reference. Propose changes there, don't edit unilaterally.
- Default behavior for anything not explicitly approved below: propose a plan, wait for confirmation, then act.

## Status — Phase 1 & 2: DONE, locked

**Feature 3 — Crime Chain Discovery:** graph builder, case linking (Case as first-class node), gang/community detection, Neo4j export — complete.

**Feature 4 — Neural Intelligence Layer:** GraphSAGE attempted via PyTorch Geometric. Two real bugs found and fixed through validation, not assumed:
1. Dot-product decoder produced an inverted AUC (~0.05) due to the graph's multipartite structure — confirmed via flipped-score test (jumped to ~0.93), fixed by swapping to an MLP decoder over concatenated embeddings.
2. MLP decoder then scored ~0.99 — too good, investigated via ablation (removed `degree` feature, AUC stayed ~0.98) — confirmed this was schema leakage: negative sampling wasn't restricted to plausible node-type pairs, so the model was just learning "these types can never connect" rather than finding real hidden links.

Decision: GNN parked as documented future work. `model_weights.pt` kept on disk, not deleted, in case it's worth revisiting later. Classical baseline (Jaccard/Adamic-Adar link prediction with a built-in explainability layer — shows shared phone/vehicle/address/FIR as the "reason") shipped instead. No leakage risk, fully explainable, already wired into `/predict/links`, `/predict/accomplices`, `/predict/clusters` with automatic fallback logic in `main.py`.

`contracts/graph-api.yaml` is updated with the explanation schema — backend and frontend owners can build against it now.

## Current task — Cytoscape.js Network Visualization (ACTIVE — build this now)

This is the flagship judge-facing feature for this module. Goal: interactive criminal network graph.

Required functionality:
1. Render the full graph from `/graph/network` (nodes + edges).
2. Click a node → side panel shows its details (type, attributes, linked case IDs, risk score if available).
3. Search box → type a name → graph zooms/centers on the matching node and highlights it.
4. Selecting a node highlights its direct connections and dims everything else.
5. Color-code nodes by type (Citizen, Case, Vehicle, Location, Organization), with a legend.

**Build approach:** standalone HTML + vanilla JS page using Cytoscape.js via CDN, calling your existing FastAPI endpoints directly (`/graph/network`, `/graph/search?name=`). No React/Next.js dependency yet — this keeps it fully demoable on its own, independent of the dashboard shell, and doesn't require the frontend dev to be present. Once it works standalone, the frontend dev can port it into a React component or embed it into the main dashboard when they join.

File location: `graph-service/viz/network_demo.html` (plus a small JS helper file in the same folder if it gets large enough to split out).

Data shape: must match whatever `/graph/network` and `/graph/search` already return per `contracts/graph-api.yaml`. Don't invent new response fields on the fly — if something's missing for the UI, flag it and update the contract first, then build against the updated version.

## Folder structure (current)

```
graph-service/
├── data/             sample_crimes.csv, fixtures
├── graph/            graph_builder.py, case_linking.py
├── analysis/         centrality.py, communities.py, hotspots.py
├── prediction/        link_prediction_baseline.py, gnn_model.py (parked), model_weights.pt (kept, unused)
├── viz/                neo4j_export.py, network_demo.html  ← current task
└── api/               main.py
```

## Workflow rules

- Work on branch `feature/graph` (or `feature/graph-viz` if you want this isolated from the merged backend work).
- Commit message format: `graph-viz: <what changed>`.
- Confirm response shapes against `contracts/graph-api.yaml` before merging to `main`.
- If a task requires touching `backend/`, `frontend/`, or `ai-services/`, stop and ask the human.

## After this task

- Confirm `hotspots.py` is built (area-wise crime counts) if not already done.
- Merge any open branches into `main`.
- Full demo rehearsal: type a name, walk through associates → gang → vehicles → risk score → explanation, live, end to end.
