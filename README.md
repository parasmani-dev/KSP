# CIOS research prototype

An exploratory crime intelligence dashboard built with Next.js and three FastAPI services. The bundled records are **synthetic** and the application is a demonstration, not a police operations system.

## Interface direction

The UI uses a restrained navy, brass, and maroon palette; a custom KSP letter shield; bilingual brand text; consistent page headers; explicit demo status; and readable empty states. It draws on the Indian government's [UX4G foundations](https://www.ux4g.gov.in/foundations) and [accessibility guidance](https://www.ux4g.gov.in/foundations/accessibility). The custom shield is not the official Karnataka Police emblem.

## Does it need a backend?

Yes. The dashboard, map, network, forecasts, copilot, and evidence workspace call Python APIs. A static frontend deployment alone will render the shell but cannot supply those features. The old Java `backend` entry in Compose was only a placeholder and is no longer part of the runtime stack.

| Service | Purpose | Container port |
| --- | --- | --- |
| `frontend` | Next.js UI and same-origin API proxy | 3000 |
| `ai-services` | Dataset access, demo stream, forecasts, copilot | 8000 (internal) |
| `graph-service` | Network queries and link analysis | 8001 (internal) |
| `evidence-engine` | FIR and evidence processing | 8002 (internal) |

## Run the demo

Install Docker Desktop or Docker Engine with Compose, start its daemon, then run from this directory:

```sh
docker compose up --build -d
docker compose ps
```

Open `http://localhost:3000`. Only the frontend port is published. Set `PORT` to change it. Inspect failures with `docker compose logs -f SERVICE_NAME`.

Evidence processing uses Gemini. To enable it, create a local `.env` file containing `GEMINI_API_KEY=...` before starting Compose. Do not commit the key. Without a working key, evidence analysis is unavailable.

The saved model files under `ai-services/models/saved` are not tracked in Git. The container therefore uses sample hotspot data and observed historical counts where supported. Model-dependent offender scoring, anomaly detection, and escalation estimates return unavailable until models are packaged and the matching Python dependencies are installed. This is a deployable **demo**, not a complete model deployment.

## Local development

Run each API from its directory with Python 3.11 and the appropriate requirements, then run the frontend with Node 22:

```sh
cd frontend
npm ci
npm run dev
```

The frontend proxies `/api/services/ai`, `/api/services/graph`, and `/api/services/evidence` to `AI_SERVICE_URL`, `GRAPH_SERVICE_URL`, and `EVIDENCE_SERVICE_URL`. Their local defaults are `http://localhost:8000`, `:8001`, and `:8002`. In Compose, the service URLs point to private container names. Set these as **server environment variables** on other hosting platforms; browser code never needs to know the API hosts.

## Deploy the demo on Render and Vercel

The repository includes a [Render Blueprint](render.yaml) for the three Python APIs. The Next.js UI runs as a Vercel project. Both platforms need access to the Git repository, so push this directory to GitHub or another supported Git provider first.

1. In Render, select **New > Blueprint**, connect the repository, and apply `render.yaml`. Wait until all three services show a successful deploy. The service URLs will look like `https://ksp-ai-services.onrender.com`, `https://ksp-graph-service.onrender.com`, and `https://ksp-evidence-engine.onrender.com`; use the actual URLs assigned by Render. Open each URL with `/health` to confirm it responds.
2. In Vercel, select **Add New > Project** and import the same repository. Set **Root Directory** to `frontend` and **Framework Preset** to Next.js. Use the repository's `npm run build` command and Node.js 22.
3. In Vercel project **Settings > Environment Variables**, add these variables for **Production** (and Preview if preview deployments should use the APIs). Use the Render origins without a trailing slash:

   | Variable | Value |
   | --- | --- |
   | `AI_SERVICE_URL` | Render URL of `ksp-ai-services` |
   | `GRAPH_SERVICE_URL` | Render URL of `ksp-graph-service` |
   | `EVIDENCE_SERVICE_URL` | Render URL of `ksp-evidence-engine` |

4. Deploy the Vercel project. If it was deployed before you entered the variables, redeploy so the server-side proxy uses the Render URLs. Open the Vercel URL and check the dashboard, map, network, predictions, and `/api/services/ai/health` and `/api/services/graph/health` endpoints.

Evidence processing needs a `GEMINI_API_KEY` environment variable on the Render **evidence-engine** service. Add it in Render only if you intend to use that feature, then redeploy that service. Never put this key in Vercel's public variables or commit it to Git.

Render's free web services can spin down while idle, so the first request may be slow. The three services share the workspace's 750 free instance hours per month; if all three run continuously, that allowance will run out. Vercel Functions have a finite runtime, so a live alert stream passing through the Next.js proxy can disconnect and need a page refresh. The free plans are suitable for a short demo; review current plan limits before choosing them for regular use.

## Deployment boundary

The Vercel and Render setup publishes an unauthenticated **synthetic-data demo**. Do not import real case data into it. For any operational use, add authentication and access controls, restrict API operations, remove demo fallback outputs, review model provenance and validation, and run a privacy/security review.
