# CLAUDE.md — Graph Analytics & Neural Intelligence Module (graph-service)

This file is the context for any AI agent (Antigravity, Claude Code, etc.) working inside this folder. Read this fully before writing or editing anything.

## Project: Crime Intelligence Operating System (CIOS)

One-line: an AI platform that turns fragmented crime data (FIRs, citizen records, locations, evidence) into actionable investigation intelligence — prediction, criminal network graphs, multi-agent investigation, citizen risk scoring, and a Kannada-language copilot. Hackathon-scale project, 4-person team, one monorepo, one folder per owner.

## Your scope: `graph-service/` ONLY

- Edit only inside `graph-service/`.
- Never modify `frontend/`, `backend/`, or `ai-services/` — those belong to other team members.
- Treat `contracts/` as read-only reference. Propose changes there, don't edit unilaterally.
- **Do not write or run any code until the human explicitly says to start.** Default behavior: propose a plan, wait for confirmation, then act.

## Your two official responsibilities — STRICT ORDER, NOT PARALLEL

You own two features. They are functionally independent — Feature 4 does not need Feature 3's code to exist conceptually — but the human has set a hard sequencing rule: **build Feature 3 to full completion first. Do not start any Feature 4 work until Feature 3 is done and confirmed by the human.** If asked or tempted to jump ahead, stop and confirm with the human first.

### Feature 3 — Crime Chain Discovery Engine (BUILD THIS FIRST)

- Criminal network graph (NetworkX) — nodes: Citizen, Crime, Location, Vehicle, Organization, Case. Relationships: ASSOCIATED_WITH, INVOLVED_IN, VISITED, OWNS, PART_OF, CONNECTED_TO.
- Relationship engine — create an edge between two entities whenever they share a phone number, vehicle, address, FIR, or accomplice.
- Case linking — `Case` must be a first-class node, explicitly linked to the citizens, locations, vehicles, and evidence tied to it. Don't just connect citizen-to-citizen; route relationships through the Case node where applicable.
- Gang detection — community detection (greedy modularity or Louvain) clustering entities into groups.
- Relationship visualization — interactive graph via Cytoscape.js: click a node for details, search by name, highlight connections.

**Definition of done for Feature 3:** graph builds correctly from sample data, case linking is traceable, gang/community output is sensible, visualization is interactive and demoable end-to-end. Nothing in Feature 4 starts before this is true.

### Feature 4 — Neural Network Intelligence Layer (ONLY AFTER FEATURE 3 IS DONE)

Independent module — reuses the same graph data structure built in Feature 3 as input, but is a separate body of work.

- Link prediction
- Hidden accomplice prediction
- Crime cluster detection

Build in this order, don't skip the first step:

1. **Classical baseline first** — NetworkX built-ins (Jaccard coefficient, Adamic-Adar, common-neighbors). No training required. This becomes the fallback floor — ships regardless of how the GNN attempt goes.
2. **GraphSAGE + PyTorch Geometric** — the real GNN layer. Time-boxed by the human with a hard checkpoint date. If it isn't working cleanly by checkpoint, ship the classical baseline only and document the GNN as future work — it must never block the demo.

## Tech stack

- **NetworkX** — core analysis engine, single source of truth for all graph logic.
- **Neo4j** — visualization layer ONLY. Push the finished graph here for a browser/demo view. Do not duplicate analysis logic in Cypher — NetworkX stays the only place decisions get made.
- **Cytoscape.js** — primary interactive frontend graph view.
- **PyTorch Geometric + GraphSAGE** — Feature 4 only, after Feature 3 ships.
- **FastAPI** — exposes both feature sets as an API.
- **pandas** — data prep / CSV handling.

## Folder structure

```
graph-service/
├── data/             sample_crimes.csv, fixtures
├── graph/            graph_builder.py — Feature 3
├── analysis/         centrality.py, communities.py, hotspots.py, case_linking.py — Feature 3
├── prediction/        link_prediction_baseline.py, gnn_model.py — Feature 4, built only after Feature 3 is done
├── viz/                neo4j_export.py — pushes final graph to Neo4j for demo view
└── api/               FastAPI app, exposes both feature sets
```

## API contract

Publish the finalized version of this to `contracts/graph-api.yaml` once stable — that file is what the backend and frontend owners build against.

Feature 3 endpoints:
- `GET /graph/network` → full graph (nodes + edges, JSON)
- `GET /graph/case/{id}` → subgraph scoped to one case
- `GET /graph/centrality` → ranked list of most influential entities
- `GET /graph/communities` → detected gangs/groups
- `GET /graph/search?name=` → node lookup by name, returns associated nodes/edges
- `GET /graph/hotspots` → area-wise crime counts

Feature 4 endpoints (added only once Feature 3 has shipped):
- `GET /predict/links` → predicted hidden connections
- `GET /predict/accomplices/{citizen_id}` → likely hidden accomplices for a given citizen
- `GET /predict/clusters` → crime cluster groupings — GNN-based if ready, falls back to Feature 3's community detection output if not

## Workflow rules

- Work on branch `feature/graph`. Never push directly to `main`.
- Before merging to `main`, confirm the contract file matches the actual response shapes being returned.
- Commit message format: `graph: <what changed>` for Feature 3 work, `graph-nn: <what changed>` for Feature 4 work — keeps the two efforts visually separated in history.
- If a task requires touching `backend/`, `frontend/`, or `ai-services/`, stop and ask the human.

## Roadmap

- **Phase 1 (Feature 3):** graph builder, case linking, gang detection, Cytoscape visualization — fully complete and demoable before### 4. Neural Intelligence Layer (Feature 4) - DONE
- **Baseline Module**: `link_prediction_baseline.py` completed using Jaccard/Adamic-Adar on NetworkX. Explains predictions by outputting mutual connections.
- **GNN Module (PyG)**: `gnn_model.py` completed. Validation revealed schema leakage (one-hot type bias) driving false 0.99 AUC. GNN parked as "Future Work".
- **API**: Endpoints (`/predict/links`, `/predict/clusters`) implemented, firmly routed to classical baseline for hackathon demo.
