"""Deterministic, non-investigative preview for the synthetic public demo."""

import re

from schemas.contradiction import ContradictionOutput
from schemas.extraction import ExtractionOutput
from schemas.processor import ProcessorInput, ProcessorOutput
from schemas.scoring import ScoringComponents, ScoringOutput
from schemas.summarization import SummaryOutput
from schemas.timeline import TimelineEvent, TimelineOutput


DEMO_NOTICE = (
    "Keyless synthetic preview. Text matches are unverified; no model, "
    "risk score, or investigative conclusion was produced."
)
PLACES = ("Whitefield", "Koramangala", "Indiranagar", "Jayanagar", "Bengaluru")


def build_demo_preview(input_data: ProcessorInput) -> ProcessorOutput:
    text = input_data.fir_text.strip()
    if not text:
        raise ValueError("FIR text is required for the demo preview.")

    people = list(dict.fromkeys(re.findall(r"\bperson named\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b", text)))
    locations = [place for place in PLACES if re.search(rf"\b{re.escape(place)}\b", text, re.I)]
    dates = list(dict.fromkeys(re.findall(r"\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b", text, re.I)))
    times = list(dict.fromkeys(re.findall(r"\b(?:[01]?\d|2[0-3]):[0-5]\d\b", text)))
    vehicles = ["white car"] if re.search(r"\bwhite car\b", text, re.I) else []

    preview = " ".join(text.split())[:240]
    if len(text) > 240:
        preview += "…"
    events = [
        TimelineEvent(timestamp=value, description="This time appears in the submitted text; the event has not been verified.")
        for value in times[:3]
    ]

    return ProcessorOutput(
        analysis_mode="synthetic_preview",
        notice=DEMO_NOTICE,
        summary=SummaryOutput(
            crime_type="Not classified",
            victim="Not assessed",
            suspect="Not assessed",
            location=locations[0] if locations else "Not identified",
            summary=f"Submitted text preview: {preview}",
            key_facts=["This is a deterministic display of submitted synthetic text, not an evidence finding."],
        ),
        entities=ExtractionOutput(persons=people, locations=locations, vehicles=vehicles, dates=dates, times=times),
        timeline=TimelineOutput(events=events),
        contradictions=ContradictionOutput([]),
        scoring=ScoringOutput(
            overall_confidence=0.0,
            components=ScoringComponents(entity_confidence=0.0, corroboration=0.0, contradictions=0.0),
        ),
    )
