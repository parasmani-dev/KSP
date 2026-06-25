import asyncio
import json
import logging
from google import genai
from pydantic import BaseModel, RootModel
from typing import List
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

# --- Schemas ---

class ContradictionItem(BaseModel):
    type: str
    field: str
    statement_1: str
    statement_2: str

class ContradictionOutput(RootModel[List[ContradictionItem]]):
    pass

class ScoringComponents(BaseModel):
    entity_confidence: float
    corroboration: float
    contradictions: float

class ScoringOutput(BaseModel):
    overall_confidence: float
    components: ScoringComponents

# --- Prompts ---

CONTRADICTION_DETECTION_PROMPT = """
You are an expert police investigator. Analyze the provided multiple police documents (FIRs, witness statements).
Identify any contradictions, inconsistencies, or conflicting information between them (e.g., mismatched times, different suspect descriptions).
For each contradiction, provide the type of contradiction, the specific field, and the two conflicting statements.
"""

EVIDENCE_SCORING_PROMPT = """
You are a senior detective. Evaluate the provided evidence documents for their trustworthiness.
Provide an overall confidence score between 0.0 and 1.0. 
Also provide component scores:
- entity_confidence: How reliable the extracted entities are.
- corroboration: Score based on how many sources corroborate the facts.
- contradictions: Negative score impact based on detected contradictions.
"""

# --- Data ---

DOCUMENTS = [
    {"doc_id": "FIR-001", "text": "The suspect arrived at 8 PM driving a red Maruti Swift."},
    {"doc_id": "WITNESS-001", "text": "The suspect arrived at 10 PM driving a white Maruti Swift."}
]

async def test_1_4_contradiction(client):
    print(f"\n--- 1.4 CONTRADICTION DETECTION ---")
    docs_text = "\n\n---\n\n".join([f"Document: {d['doc_id']}\nText: {d['text']}" for d in DOCUMENTS])
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"{CONTRADICTION_DETECTION_PROMPT}\n\nHere are the documents to analyze:\n\n{docs_text}",
        config={
            'response_mime_type': 'application/json',
            'response_schema': ContradictionOutput,
            'temperature': 0.0
        }
    )
    result = json.loads(response.text)
    print("OUTPUT JSON:")
    print(json.dumps(result, indent=2))


async def test_1_5_scoring(client):
    print(f"\n--- 1.5 EVIDENCE SCORING ---")
    docs_text = "\n\n---\n\n".join([f"Document: {d['doc_id']}\nText: {d['text']}" for d in DOCUMENTS])
    
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"{EVIDENCE_SCORING_PROMPT}\n\nStatement/Document to score:\n\n{docs_text}",
        config={
            'response_mime_type': 'application/json',
            'response_schema': ScoringOutput,
            'temperature': 0.0
        }
    )
    result = json.loads(response.text)
    print("OUTPUT JSON:")
    print(json.dumps(result, indent=2))


async def run_tests():
    client = genai.Client()
    await test_1_4_contradiction(client)
    await test_1_5_scoring(client)

if __name__ == "__main__":
    asyncio.run(run_tests())
