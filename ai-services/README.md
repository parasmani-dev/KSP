# AI services

The FastAPI app in `api/main.py` serves the synthetic dashboard data, sample scenarios, and the keyless copilot guide. It reads the tracked `Dataset/*_sample.csv` files through the repository root.

`models/` contains training experiments. Generated files under `models/saved/` are local artifacts and are not packaged for the public demo. `CIOS_DEMO_MODE` defaults to `1`; model-dependent endpoints report that a model is unavailable.

Run the maintained tests from this directory with `python -m pytest -q`. The root [README](../README.md) has the complete local and Render/Vercel setup.
