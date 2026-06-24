from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import StreamingResponse
import asyncio, json, os
import pandas as pd
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

from fastapi import APIRouter, BackgroundTasks, Request

@router.post("/fusion/simulate-fir")
async def simulate_fir(request: Request):
    body = await request.json()
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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "Dataset") if os.path.exists(os.path.join(ROOT_DIR, "Dataset")) else os.path.join(BASE_DIR, "Dataset")

_simulation_running = False

async def run_simulation():
    global _simulation_running
    if _simulation_running:
        return
    _simulation_running = True
    
    try:
        file_path = os.path.join(DATA_DIR, "kafka_seed_events_sample.csv")
        if not os.path.exists(file_path):
            file_path = os.path.join(DATA_DIR, "kafka_seed_events.csv")
        df = pd.read_csv(file_path)
    except Exception as e:
        print("Failed to load kafka seed events", e)
        _simulation_running = False
        return

    for _, row in df.iterrows():
        if not _simulation_running:
            break
            
        event = row.to_dict()
        event = {k: ("" if pd.isna(v) else v) for k, v in event.items()}
        
        # Give it a generic alert type if none exists so the frontend parses it nicely
        if "alert_type" not in event:
            event_type = event.get("event_type", "Simulated Event")
            if event_type == "NEW_FIR":
                event["alert_type"] = f"New FIR: {event.get('crime_type', 'Unknown')}"
            else:
                event["alert_type"] = str(event_type).replace("_", " ").title()
            
        await broadcast(event)
        await asyncio.sleep(2.0)
        
    _simulation_running = False

@router.post("/fusion/start-simulation")
async def start_simulation(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_simulation)
    return {"status": "Simulation started"}

@router.post("/fusion/stop-simulation")
async def stop_simulation():
    global _simulation_running
    _simulation_running = False
    return {"status": "Simulation stopped"}
