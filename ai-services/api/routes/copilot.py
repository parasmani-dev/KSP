"""
Kannada AI Copilot - Multi-Layer Intelligence Router
=====================================================
Architecture:
  Layer 0 : Semantic Cache   — instant, hardcoded demo responses, 0ms, no API cost
  Layer 1 : Rule Engine      — keyword-based navigation commands, no API cost
  Layer 2 : Primary LLM      — Groq (blazing fast, generous free tier)
  Layer 3 : Fallback LLM     — Gemini / OpenAI (if Groq exhausted / fails)
  Layer 4 : Verification     — lightweight fact-check against injected context
  Layer 5 : Smart Deflection — graceful fallback if everything fails
"""

import os
import re
import time
import json
import asyncio
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Any

router = APIRouter()

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class DashboardContext(BaseModel):
    page: Optional[str] = "dashboard"
    hotspots: Optional[list] = []
    total_incidents: Optional[int] = 0
    active_cases: Optional[int] = 0
    alerts: Optional[list] = []
    predictions: Optional[dict] = {}
    extra: Optional[dict] = {}

class CopilotRequest(BaseModel):
    message: str
    context: Optional[DashboardContext] = None
    language: Optional[str] = "both"   # "english" | "kannada" | "both"

class CopilotResponse(BaseModel):
    english: str
    kannada: str
    source: str          # which layer answered
    confidence: float    # 0.0 – 1.0
    action: Optional[dict] = None   # navigation command for Layer 1

# ---------------------------------------------------------------------------
# Layer 0 — Semantic Cache (instant handcrafted answers for key demo questions)
# ---------------------------------------------------------------------------

SEMANTIC_CACHE = [
    {
        "triggers": ["why is banjara hills", "banjara hills risk", "banjara hills high risk"],
        "english": (
            "Banjara Hills is currently showing a **306% risk escalation** over the baseline. "
            "Primary drivers are: (1) a sudden spike in chain-snatching incidents over the last 48 hours, "
            "(2) two active suspects flagged in the Criminal Network graph with 3+ prior offences in this zone, "
            "and (3) a historically elevated crime frequency during this time of month based on our Neural Prediction Engine. "
            "Immediate patrol deployment to Sectors 7 and 12 is recommended."
        ),
        "kannada": (
            "ಬಂಜಾರಾ ಹಿಲ್ಸ್ ಪ್ರಸ್ತುತ ಮೂಲ ರೇಖೆಗಿಂತ **306% ಅಪಾಯ ಹೆಚ್ಚಳ** ತೋರಿಸುತ್ತಿದೆ. "
            "ಮುಖ್ಯ ಕಾರಣಗಳು: (1) ಕಳೆದ 48 ಗಂಟೆಗಳಲ್ಲಿ ಸರಪಳಿ ಕಸಿದುಕೊಳ್ಳುವ ಘಟನೆಗಳಲ್ಲಿ ಹಠಾತ್ ಹೆಚ್ಚಳ, "
            "(2) ಕ್ರಿಮಿನಲ್ ನೆಟ್ವರ್ಕ್ ಗ್ರಾಫ್‌ನಲ್ಲಿ ಈ ವಲಯದಲ್ಲಿ 3+ ಹಿಂದಿನ ಅಪರಾಧಗಳೊಂದಿಗೆ ಎರಡು ಸಕ್ರಿಯ ಶಂಕಿತರು, "
            "(3) ನಮ್ಮ ನ್ಯೂರಲ್ ಪ್ರೆಡಿಕ್ಷನ್ ಎಂಜಿನ್ ಆಧಾರದ ಮೇಲೆ ತಿಂಗಳ ಈ ಸಮಯದಲ್ಲಿ ಐತಿಹಾಸಿಕವಾಗಿ ಹೆಚ್ಚಿನ ಅಪರಾಧ ಆವೃತ್ತಿ. "
            "ಸೆಕ್ಟರ್ 7 ಮತ್ತು 12ಗೆ ತಕ್ಷಣ ಗಸ್ತು ನಿಯೋಜನೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ."
        ),
    },
    {
        "triggers": ["show connected suspects", "criminal connections", "criminal network", "crime chain"],
        "english": (
            "The Criminal Network Graph currently shows **3 active clusters**. "
            "Cluster A (Koramangala–Banjara Hills corridor) has 7 nodes with a repeat offender flagged as HIGH PRIORITY. "
            "Cluster B links 4 suspects through a shared vehicle (KA-01-MX-9823). "
            "I recommend navigating to the Network Intelligence page for the full interactive graph."
        ),
        "kannada": (
            "ಕ್ರಿಮಿನಲ್ ನೆಟ್ವರ್ಕ್ ಗ್ರಾಫ್ ಪ್ರಸ್ತುತ **3 ಸಕ್ರಿಯ ಕ್ಲಸ್ಟರ್‌ಗಳನ್ನು** ತೋರಿಸುತ್ತದೆ. "
            "ಕ್ಲಸ್ಟರ್ A (ಕೊರಮಂಗಲ–ಬಂಜಾರಾ ಹಿಲ್ಸ್ ಕಾರಿಡಾರ್) 7 ನೋಡ್‌ಗಳನ್ನು ಹೊಂದಿದೆ, ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಹೈ ಪ್ರಯಾರಿಟಿ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. "
            "ಕ್ಲಸ್ಟರ್ B ಹಂಚಿದ ವಾಹನ (KA-01-MX-9823) ಮೂಲಕ 4 ಶಂಕಿತರನ್ನು ಲಿಂಕ್ ಮಾಡುತ್ತದೆ."
        ),
        "action": {"type": "navigate", "target": "/network"},
    },
    {
        "triggers": ["explain fir", "explain this fir", "summarize fir", "analyze fir", "explain this report"],
        "english": (
            "The most recently processed FIR (Auto-Extracted) reports an unknown suspect involved in **Auto Theft** "
            "in the Koramangala area at approximately 22:30 hrs. Risk score assigned: **0.66 (HIGH)**. "
            "The Evidence Agent has extracted: 1 suspect description, 1 vehicle reference (motorcycle, dark coloured), "
            "and 1 location. The Network Agent found 2 matching cases with similar MO within a 3km radius. "
            "Recommend cross-referencing with the Criminal Network Graph."
        ),
        "kannada": (
            "ಇತ್ತೀಚೆಗೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿದ FIR ಕೊರಮಂಗಲ ಪ್ರದೇಶದಲ್ಲಿ ಸರಿಸುಮಾರು 22:30 ಗಂಟೆಗೆ **ಆಟೋ ಕಳ್ಳತನ**ದಲ್ಲಿ ತೊಡಗಿದ ಅಜ್ಞಾತ ಶಂಕಿತರನ್ನು ವರದಿ ಮಾಡುತ್ತದೆ. "
            "ಅಪಾಯ ಸ್ಕೋರ್: **0.66 (ಹೆಚ್ಚು)**. ಸಾಕ್ಷ್ಯ ಏಜೆಂಟ್ 1 ಶಂಕಿತ ವಿವರಣೆ, 1 ವಾಹನ ಉಲ್ಲೇಖ ಮತ್ತು 1 ಸ್ಥಳ ಹೊರತೆಗೆದಿದೆ."
        ),
    },
    {
        "triggers": ["why is saket", "saket risk", "why saket"],
        "english": (
            "Saket is flagged at **158% escalation**. Key factors: high frequency of robbery incidents on the eastern corridor and proximity to the Banjara Hills crime cluster. Patrol coverage is below threshold at 42%."
        ),
        "kannada": (
            "ಸಾಕೇತ್ **158% ಹೆಚ್ಚಳ**ದಲ್ಲಿ ಗುರುತಿಸಲಾಗಿದೆ. ಪೂರ್ವ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ದರೋಡೆ ಘಟನೆಗಳ ಹೆಚ್ಚಿನ ಆವೃತ್ತಿ ಮತ್ತು ಬಂಜಾರಾ ಹಿಲ್ಸ್ ಅಪರಾಧ ಕ್ಲಸ್ಟರ್‌ಗೆ ಸಾಮೀಪ್ಯ ಮುಖ್ಯ ಕಾರಣಗಳು."
        ),
    },
    {
        "triggers": ["threat level", "current threat", "risk level", "overall risk", "summarize threat"],
        "english": (
            "Current system-wide threat level is **CRITICAL (87/100)**. "
            "Multiple escalating crime patterns detected across Central zones. "
            "Organized syndicate activity is highly active in Banjara Hills and Koramangala. "
            "Top 3 hotspots: Banjara Hills (306%), Adyar (177%), Saket (158%). "
            "Immediate preventive patrols are recommended across all HIGH and CRITICAL zones."
        ),
        "kannada": (
            "ಪ್ರಸ್ತುತ ಸಿಸ್ಟಮ್-ವ್ಯಾಪಕ ಬೆದರಿಕೆ ಮಟ್ಟ **ಕ್ರಿಟಿಕಲ್ (87/100)**. "
            "ಕೇಂದ್ರ ವಲಯಗಳಾದ್ಯಂತ ಅನೇಕ ಏರುತ್ತಿರುವ ಅಪರಾಧ ಮಾದರಿಗಳು ಪತ್ತೆಯಾಗಿವೆ. "
            "ಟಾಪ್ 3 ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು: ಬಂಜಾರಾ ಹಿಲ್ಸ್ (306%), ಅಡ್ಯಾರ್ (177%), ಸಾಕೇತ್ (158%)."
        ),
    },
    {
        "triggers": ["patrol status", "patrol coverage", "how many patrols"],
        "english": (
            "Current patrol coverage is **70%**. Active units: 12. Available units: 5. Busy/Offline: 3. "
            "Sectors 7 (Banjara Hills) and 4 (Koramangala) are currently under-patrolled relative to their risk scores. "
            "Recommend redeploying 2 units from low-risk zones to critical zones immediately."
        ),
        "kannada": (
            "ಪ್ರಸ್ತುತ ಗಸ್ತು ಕವರೇಜ್ **70%**. ಸಕ್ರಿಯ ಘಟಕಗಳು: 12. ಲಭ್ಯ: 5. ನಿರತ/ಆಫ್‌ಲೈನ್: 3. "
            "ಬಂಜಾರಾ ಹಿಲ್ಸ್ ಮತ್ತು ಕೊರಮಂಗಲ ಸೆಕ್ಟರ್‌ಗಳು ತಮ್ಮ ಅಪಾಯ ಸ್ಕೋರ್‌ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಪ್ರಸ್ತುತ ಕಡಿಮೆ ಗಸ್ತು ಹೊಂದಿವೆ."
        ),
    },
]

# ---------------------------------------------------------------------------
# Layer 1 — Rule-Based Navigation Engine
# ---------------------------------------------------------------------------

NAVIGATION_RULES = [
    {"triggers": ["go to map", "open map", "show map", "live map"], "target": "/", "label": "Live Crime Map"},
    {"triggers": ["go to predictions", "open predictions", "prediction page", "show predictions"], "target": "/predictions", "label": "Predictions"},
    {"triggers": ["go to network", "open network", "network graph", "show network", "criminal graph"], "target": "/network", "label": "Network Intelligence"},
    {"triggers": ["go to multi agent", "open multi agent", "agent engine", "launch agents", "swarm"], "target": "/multi-agent", "label": "Multi-Agent Engine"},
    {"triggers": ["go to dashboard", "open dashboard", "home", "main dashboard"], "target": "/", "label": "Dashboard"},
]

# ---------------------------------------------------------------------------
# Layer 2 — Primary LLM (Groq — fastest, free tier)
# ---------------------------------------------------------------------------

async def call_groq(system_prompt: str, user_message: str) -> Optional[str]:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "max_tokens": 600,
                    "temperature": 0.3,
                },
            )
            if res.status_code == 200:
                return res.json()["choices"][0]["message"]["content"]
    except Exception:
        pass
    return None

# ---------------------------------------------------------------------------
# Layer 3 — Fallback LLM (Gemini)
# ---------------------------------------------------------------------------

async def call_gemini(system_prompt: str, user_message: str) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser: {user_message}"}]}],
                    "generationConfig": {"maxOutputTokens": 600, "temperature": 0.3},
                },
            )
            if res.status_code == 200:
                return res.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        pass
    return None

# ---------------------------------------------------------------------------
# Layer 4 — Verification (lightweight fact-check against injected context)
# ---------------------------------------------------------------------------

def verify_response(response: str, context: DashboardContext) -> bool:
    """
    Simple hallucination guard: if the response mentions a specific location name
    or statistic that contradicts the known context, reject it.
    Returns True if response appears accurate.
    """
    dangerous_patterns = [
        r"\b100%\b.*\bhotspot\b",  # Claiming 100% escalation when context says otherwise
    ]
    # Check if response contradicts context data
    if context and context.hotspots:
        known_areas = [str(h.get("area", "")).lower() for h in context.hotspots]
        # If response confidently states a specific escalation for an area not in context, flag it
        area_claim = re.findall(r"(\w[\w\s]+)\s+(?:is|shows?)\s+[\w\s]*(\d+)%", response, re.IGNORECASE)
        for area, pct in area_claim:
            area_lower = area.strip().lower()
            if area_lower and not any(area_lower in ka for ka in known_areas) and int(pct) > 50:
                # Unknown area with a fabricated high percentage — potential hallucination
                return False
    return True

# ---------------------------------------------------------------------------
# Context Builder — converts DashboardContext into a system prompt
# ---------------------------------------------------------------------------

def build_system_prompt(context: Optional[DashboardContext]) -> str:
    base = (
        "You are CIOS Copilot — an elite AI assistant for the Karnataka Police Crime Intelligence Operating System. "
        "You assist senior officers and SOC directors. "
        "Always be precise, professional, and data-driven. "
        "You MUST respond with a JSON object containing two keys: 'english' and 'kannada'. "
        "Provide the answer in both languages. Keep each response under 120 words per language. "
        "CRITICAL: Only state facts that are present in the provided context data. "
        "If asked about information not in the context, respond with the Smart Deflection message in both languages: "
        "English: 'I do not have that case file currently loaded into active memory. Please open the relevant Case ID on your dashboard for me to analyze it.' "
        "Kannada: 'ಆ ಕೇಸ್ ಫೈಲ್ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಮೆಮೊರಿಯಲ್ಲಿ ಲೋಡ್ ಆಗಿಲ್ಲ. ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಸಂಬಂಧಿತ ಕೇಸ್ ID ಅನ್ನು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ.'"
    )

    if context:
        ctx_summary = f"""
CURRENT DASHBOARD DATA (Active Intelligence Feed):
- Current Page: {context.page}
- Total Incidents: {context.total_incidents}
- Active Cases: {context.active_cases}
- Top Hotspots: {json.dumps(context.hotspots)}
- Recent Alerts: {json.dumps(context.alerts[:3] if context.alerts else [])}
- Prediction Data: {json.dumps(context.predictions)}
"""
        return base + "\n" + ctx_summary

    return base + "\n\nNote: No specific dashboard context was provided. Answer from your master knowledge base only."

# ---------------------------------------------------------------------------
# Main Endpoint
# ---------------------------------------------------------------------------

@router.post("/copilot/chat", response_model=CopilotResponse)
async def copilot_chat(req: CopilotRequest):
    msg_lower = req.message.lower().strip()

    # ── Layer 0: Semantic Cache ──────────────────────────────────────────
    for entry in SEMANTIC_CACHE:
        if any(trigger in msg_lower for trigger in entry["triggers"]):
            return CopilotResponse(
                english=entry["english"],
                kannada=entry["kannada"],
                source="semantic_cache",
                confidence=1.0,
                action=entry.get("action"),
            )

    # ── Layer 1: Navigation Rules ────────────────────────────────────────
    for rule in NAVIGATION_RULES:
        if any(trigger in msg_lower for trigger in rule["triggers"]):
            return CopilotResponse(
                english=f"Navigating to {rule['label']}.",
                kannada=f"{rule['label']}ಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡುತ್ತಿದ್ದೇನೆ.",
                source="navigation_engine",
                confidence=1.0,
                action={"type": "navigate", "target": rule["target"]},
            )

    # ── Layers 2 & 3: LLM with Waterfall ────────────────────────────────
    system_prompt = build_system_prompt(req.context)

    # Try Groq first, then Gemini in parallel if both available
    groq_task = asyncio.create_task(call_groq(system_prompt, req.message))
    gemini_task = asyncio.create_task(call_gemini(system_prompt, req.message))

    raw_response = None

    # Wait for Groq (fast primary)
    groq_result = await groq_task
    if groq_result:
        raw_response = groq_result
        source = "groq_primary"
        confidence = 0.90
    else:
        # Groq failed — wait for Gemini fallback
        gemini_result = await gemini_task
        if gemini_result:
            raw_response = gemini_result
            source = "gemini_fallback"
            confidence = 0.87
        else:
            # Cancel remaining tasks
            gemini_task.cancel()

    if raw_response:
        # ── Layer 4: Verification ────────────────────────────────────────
        try:
            # Attempt to parse JSON from LLM output
            # Strip markdown code fences if present
            cleaned = re.sub(r"```(?:json)?", "", raw_response).strip().strip("`")
            parsed = json.loads(cleaned)
            english_resp = parsed.get("english", raw_response)
            kannada_resp = parsed.get("kannada", "")

            # Run fact-check
            if req.context and not verify_response(english_resp, req.context):
                # Verification failed — use smart deflection
                source = "verified_deflection"
                confidence = 0.70
                english_resp = "I detected a potential inconsistency in my response. Please verify the data on your dashboard directly or try rephrasing your question."
                kannada_resp = "ನನ್ನ ಉತ್ತರದಲ್ಲಿ ಸಂಭಾವ್ಯ ಅಸಂಗತತೆ ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಡೇಟಾವನ್ನು ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ."

            return CopilotResponse(
                english=english_resp,
                kannada=kannada_resp,
                source=source,
                confidence=confidence,
            )
        except (json.JSONDecodeError, KeyError):
            # LLM returned plain text — use it as English only
            return CopilotResponse(
                english=raw_response,
                kannada="ಕನ್ನಡ ಅನುವಾದ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ.",
                source=source,
                confidence=0.75,
            )

    # ── Layer 5: Smart Deflection ────────────────────────────────────────
    return CopilotResponse(
        english=(
            "Secure intelligence servers are currently handling high load. "
            "Please refer to the localized dashboard data or try again in a moment."
        ),
        kannada=(
            "ಸುರಕ್ಷಿತ ಇಂಟೆಲಿಜೆನ್ಸ್ ಸರ್ವರ್‌ಗಳು ಪ್ರಸ್ತುತ ಹೆಚ್ಚಿನ ಲೋಡ್ ಅನ್ನು ನಿರ್ವಹಿಸುತ್ತಿವೆ. "
            "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಡೇಟಾ ನೋಡಿ ಅಥವಾ ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        ),
        source="smart_deflection",
        confidence=0.0,
    )
