# CLAUDE.md — End-to-End Demo Flow Verification (graph-service)

> INTERNAL WORKING FILE — for agent context only.
> Do NOT commit this file. Must stay in `.gitignore`.

Read this fully before doing anything.

---

## What this task is

This is NOT a build task. This is a live integration test.

The goal: run the full demo flow exactly as it will happen in front of judges. Find every break, blank, crash, or wrong data before demo day. Fix only what is broken. Do not refactor, do not redesign, do not add features.

If you discover something that needs a real design or architecture decision — stop, document it, flag it to the human. Do not silently fix architectural issues.

---

## Pre-conditions — confirm all before starting

1. FastAPI server running locally on `http://localhost:8000`.
2. Sample data loaded into the graph (run `graph_builder.py` against `data/sample_crimes.csv` if not already done).
3. `graph_standalone.html` open in browser served via `python -m http.server` from `graph-service/viz/` (NOT opened as a raw `file://` — CORS will block fetches).
4. All five node types present in the sample data: Citizen, Case, Vehicle, Location, Organization. Note: Vehicle nodes and links were added via a targeted fixture column (`vehicle_id`) in `mock_graph.csv`.
5. At least one Citizen node who is connected to: a Case, another Citizen (accomplice), and a Vehicle. This is the "Criminal X" path the demo must walk. Sunil Patel is our "Criminal X".

---

## The exact demo flow to run — do this in order, don't skip steps

### Step 1 — Graph loads

Open the page. Full graph must render within 3 seconds. All node types visible. Colors match the dark-ops palette. No console errors on load.

**Pass:** graph visible, colored, no errors.
**Fail:** blank canvas, CORS error, fetch error, wrong colors — document exactly what failed and where.

---

### Step 2 — Search "Criminal X"

Type the exact name of your highest-connected Citizen node into the search bar. Hit search.

Expected:
- Graph centers and zooms onto that node.
- Node gets highlighted, rest dims.
- No page freeze on large graphs.

**Pass:** node found, centered, highlighted cleanly.
**Fail:** "no match" on a name that exists → bug in search logic or name mismatch between graph data and search index. Document the exact name tried and the exact response from `/graph/search?name=`.

---

### Step 3 — Inspector Panel: raw properties

Click the same Citizen node.

Expected in the panel:
- Node type badge visible, correct color (`#58a6ff` for Citizen).
- Node ID in monospace.
- Properties table shows: name, age, risk_score (NOT threat_level — that field does not exist in the schema), any other real attributes on this node.
- No blank rows, no "undefined", no "null" displayed as literal text.

**Known schema trap:** if any property renders as `undefined` or `null`, the graph_builder is not populating that field from the CSV. Document which field, check the CSV column name, fix the mapping in `graph_builder.py`. Do not paper over it with a frontend null-check that hides missing data.

---

### Step 4 — Inspector Panel: AI Explanation

Same node, same click. AI Explanation box must appear above the properties table.

Expected narrative must include:
- The Citizen's risk level (derived from `risk_score`, NOT `threat_level`).
- At least one Case they are linked to (by case ID or crime type).
- At least one accomplice (another Citizen linked via shared Case).
- The explanation box styled with `border-left: 4px solid #58a6ff`.

**Pass:** readable paragraph, all three elements present, styled correctly.
**Fail states to check:**
- Explanation is blank → `/graph/explain/{node_id}` returning empty or erroring. Hit the endpoint directly in browser, check raw response.
- Explanation mentions "investigating_officer" → that field doesn't exist, explainer.py has a schema bug. Fixed in `analysis/explainer.py`.
- Explanation says "threat_level" → wrong field name. Note: `threat_level` is dynamically translated to `risk_score` in `explainer.py` as a band-aid. The underlying schema in `entities.csv` still needs fixing.
- Accomplice sentence is missing → check if Citizen-to-Citizen connections exist in sample data via shared Case. If not, add a fixture edge.

---

### Step 5 — Neighbor highlight + pulse

Still on the same Citizen node.

Expected:
- Direct neighbors (linked Case, Vehicle, accomplice Citizen) highlighted.
- All other nodes dimmed to `opacity: 0.15`.
- Neighbor nodes pulsed once (CSS class `pulse` added then removed after ~600ms) — visible, not looping.
- Highlighted edges turn `#58a6ff`.

**Pass:** all neighbors highlighted, dimming correct, pulse fires once cleanly.
**Fail:** pulse loops → `removeClass('pulse')` setTimeout not firing. Fixed in `graph_standalone.html`.

---

### Step 6 — Walk the chain manually

From "Criminal X", click through to:

1. Their linked **Case** node — panel must show: crime type, area, status, list of involved citizens. Explanation must use the Case template (not the Citizen template).
2. From that Case, click a second **Citizen** (the accomplice) — panel must re-populate for that node. Previous node must deselect cleanly.
3. From that Citizen, click their **Vehicle** node — panel must use the generic fallback template (not crash, not blank).
4. Click a **Location** node — same, generic fallback.

This is the actual judge walkthrough path. Every node type in the chain must produce something readable.

**Pass:** each click repopulates panel correctly, no stale data from previous selection.
**Fail:** panel shows old node's data after clicking new node → panel clear logic not firing on new selection. Fix the `cy.on('tap', 'node')` handler to clear panel content before populating.

---

### Step 7 — Edge cases (run these last)

7a. Search a name that doesn't exist → "No match found" in muted text, no crash.
7b. Kill the FastAPI server, click a node → error banner in `#f85149`, panel doesn't break or freeze.
7c. Click an isolated node (no edges) → panel shows "No recorded connections found" in AI Explanation, properties still render.
7d. Refresh page with server running → graph reloads cleanly from scratch, no stale state.

---

## Output expected from agent

After running all steps, report back with:

1. **PASS / FAIL per step** — exact step number, exact failure observed.
2. **Files changed** — list only. No unrequested refactors.
3. **Flags for human** — anything that needs an architectural decision before fixing (schema gaps, missing sample data, contract changes).

Do not declare "all passed" without running every step including the edge cases in Step 7. Do not fix issues silently without reporting them.

---

## Branch & commit

Branch: `feature/graph-viz-ui` (same as UI upgrade, these are in the same file).
Commit format: `graph-viz: fix <what was broken>` — one commit per fix, not one giant commit at the end.
Only files in scope: `graph-service/viz/graph_standalone.html`, `graph-service/analysis/explainer.py`, `graph-service/graph/graph_builder.py`.
Anything else requires human approval before touching.
