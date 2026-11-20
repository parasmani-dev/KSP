import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const services: Record<string, string> = {
  ai: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  graph: process.env.GRAPH_SERVICE_URL || 'http://localhost:8001',
  evidence: process.env.EVIDENCE_SERVICE_URL || 'http://localhost:8002',
};

async function proxy(request: NextRequest, context: { params: Promise<{ service: string; path: string[] }> }) {
  const { service, path } = await context.params;
  const origin = services[service];
  if (!origin) return Response.json({ error: 'Unknown service' }, { status: 404 });

  const endpoint = path.join('/');
  const allowed = request.method === 'GET'
    ? (service === 'ai' && (endpoint === 'health' || endpoint.startsWith('data/') || endpoint.startsWith('predictions/') || endpoint.startsWith('recommendations/') || endpoint === 'stream/alerts'))
      || (service === 'graph' && (endpoint === 'health' || endpoint.startsWith('graph/') || endpoint.startsWith('predict/')))
      || (service === 'evidence' && endpoint === 'health')
    : request.method === 'POST' && ((service === 'ai' && ['fusion/start-simulation', 'fusion/stop-simulation', 'fusion/simulate-fir', 'copilot/chat', 'predictions/emerging_threats'].includes(endpoint)) || (service === 'evidence' && endpoint === 'api/v1/processor'));
  if (!allowed) return Response.json({ error: 'Operation unavailable' }, { status: 404 });

  const target = new URL(`${origin.replace(/\/$/, '')}/${path.map(encodeURIComponent).join('/')}`);
  target.search = request.nextUrl.search;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
    });
    const responseHeaders = new Headers();
    for (const key of ['content-type', 'cache-control']) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    if (responseHeaders.get('content-type')?.includes('text/event-stream')) {
      responseHeaders.set('x-accel-buffering', 'no');
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: `${service} service unavailable` }, { status: 503 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
