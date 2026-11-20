"""Keyless guide for the public, synthetic CIOS demonstration.

This endpoint deliberately does not make live threat or person-risk claims. It
helps visitors find the screens that contain the corresponding sample data.
"""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()


class DashboardContext(BaseModel):
    page: Optional[str] = "dashboard"
    hotspots: Optional[list] = None
    total_incidents: Optional[int] = None
    active_cases: Optional[int] = None
    alerts: Optional[list] = None
    predictions: Optional[dict] = None
    extra: Optional[dict] = None


class CopilotRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    context: Optional[DashboardContext] = None
    language: Optional[str] = "both"


class CopilotResponse(BaseModel):
    english: str
    kannada: str
    source: str
    confidence: float = 0.0
    action: Optional[dict] = None


GUIDES = (
    {
        "terms": ("evidence", "fir", "report"),
        "target": "/multi-agent",
        "label": "Evidence workspace",
        "english": "The evidence workspace can preview a fictional report and show explicit text matches without an API key. Its keyless mode does not produce investigative conclusions.",
        "kannada": "ಸಾಕ್ಷ್ಯ ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿ ಕೃತಕ ವರದಿಯ ಪಠ್ಯ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ನೋಡಬಹುದು. ಕೀ ಇಲ್ಲದ ಮಾದರಿ ತನಿಖಾ ತೀರ್ಮಾನಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ.",
    },
    {
        "terms": ("network", "connected", "link", "suspect"),
        "target": "/network",
        "label": "Network analysis",
        "english": "The network page shows relationships in the synthetic graph. Select a node to inspect its sample links; these links are not real case findings.",
        "kannada": "ನೆಟ್‌ವರ್ಕ್ ಪುಟದಲ್ಲಿ ಕೃತಕ ಗ್ರಾಫ್‌ನ ಸಂಬಂಧಗಳನ್ನು ನೋಡಬಹುದು. ಅವು ನೈಜ ಪ್ರಕರಣದ ಕಂಡುಹಿಡಿಯುವಿಕೆಗಳಲ್ಲ.",
    },
    {
        "terms": ("forecast", "prediction", "anomaly", "risk", "threat"),
        "target": "/predictions",
        "label": "Forecast review",
        "english": "The forecast page displays synthetic sample patterns. Some research models are not packaged in this public demo, so unavailable model outputs are labeled rather than guessed.",
        "kannada": "ಮುನ್ಸೂಚನೆ ಪುಟವು ಕೃತಕ ಮಾದರಿ ಮಾದರಿಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. ಕೆಲವು ಸಂಶೋಧನಾ ಮಾದರಿಗಳು ಈ ಸಾರ್ವಜನಿಕ ಪ್ರದರ್ಶನದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.",
    },
    {
        "terms": ("patrol", "dashboard", "overview", "status"),
        "target": "/",
        "label": "Command overview",
        "english": "The overview shows counts and patrol entries from bundled synthetic records. It is a walkthrough of the interface, not a live operational status.",
        "kannada": "ಅವಲೋಕನ ಪುಟವು ಕೃತಕ ದಾಖಲೆಗಳ ಎಣಿಕೆ ಮತ್ತು ಗಸ್ತು ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. ಇದು ನೈಜ ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಥಿತಿಯಲ್ಲ.",
    },
    {
        "terms": ("map", "hotspot", "area", "location"),
        "target": "/map",
        "label": "Geospatial map",
        "english": "The map explores synthetic location records. Use its filters to inspect the sample; the markers do not represent live incidents.",
        "kannada": "ನಕ್ಷೆಯಲ್ಲಿ ಕೃತಕ ಸ್ಥಳ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು. ಗುರುತುಗಳು ನೈಜ ಘಟನೆಗಳಲ್ಲ.",
    },
)


@router.post("/copilot/chat", response_model=CopilotResponse)
async def copilot_chat(request: CopilotRequest) -> CopilotResponse:
    message = request.message.casefold().strip()
    for guide in GUIDES:
        if any(term in message for term in guide["terms"]):
            return CopilotResponse(
                english=guide["english"],
                kannada=guide["kannada"],
                source="demo_guide",
                action={"type": "navigate", "target": guide["target"], "label": guide["label"]},
            )
    return CopilotResponse(
        english="I can guide you through the synthetic demo. Ask about the map, network, forecasts, patrol overview, or evidence workspace.",
        kannada="ಈ ಕೃತಕ ಪ್ರದರ್ಶನದ ನಕ್ಷೆ, ನೆಟ್‌ವರ್ಕ್, ಮುನ್ಸೂಚನೆ ಅಥವಾ ಸಾಕ್ಷ್ಯ ಕಾರ್ಯಸ್ಥಳದ ಬಗ್ಗೆ ಕೇಳಿ.",
        source="demo_guide",
    )
