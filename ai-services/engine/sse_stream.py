from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio, json
from engine.alert_manager import evaluate_event, get_incremental_hotspot_update

router = APIRouter()
_subscribers: list[asyncio.Queue] = []

async def event_generator(queue: asyncio.Queue):
    yield f"data: {json.dumps({'status': 'Connected', 'message': 'Listening for live events...'})}\n\n"
    while True:
        data = await queue.get()
        yield f"data: {json.dumps(data)}\n\n"

@router.get("/stream/alerts")
async def stream_alerts():
    queue = asyncio.Queue()
    _subscribers.append(queue)
    async def cleanup():
        _subscribers.remove(queue)
    return StreamingResponse(
        event_generator(queue),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache",
                 "X-Accel-Buffering": "no"}
    )

async def broadcast(event: dict):
    for q in _subscribers:
        await q.put(event)

@router.post("/fusion/simulate-fir")
async def simulate_fir(body: dict):
    # Call alert_manager.get_incremental_hotspot_update(body) first
    updated_hotspot = get_incremental_hotspot_update(body)
    
    # Call alert_manager.evaluate_event(body) with the updated risk score
    alert = evaluate_event(body, provided_risk_score=updated_hotspot["risk_score"])
    
    # Broadcast updated hotspot first, then alert if it exists
    await broadcast(updated_hotspot)
    if alert:
        await broadcast(alert)
        
    return {
        "fir_received": body,
        "alert_generated": alert,
        "hotspot_updated": updated_hotspot,
        "stream_endpoint": "/stream/alerts"
    }
