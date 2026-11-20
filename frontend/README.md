# CIOS frontend

This Next.js application is the visitor interface for the synthetic CIOS demo. See the [project README](../README.md) for screenshots, scope, local setup, and Render/Vercel deployment.

For frontend development, install Node.js 22 and run:

```sh
npm ci
npm run dev
```

The server-side API proxy uses `AI_SERVICE_URL`, `GRAPH_SERVICE_URL`, and `EVIDENCE_SERVICE_URL`. The defaults target local services on ports 8000, 8001, and 8002. No browser-side API key is required.
