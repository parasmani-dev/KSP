import asyncio
import json
import logging
from google import genai
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

# Schema exactly matching the user's requested output
class SummaryOutput(BaseModel):
    crime_type: str = Field(description="The primary type of crime")
    victim: str = Field(description="The victim's name or description")
    suspect: str = Field(description="The suspect's name or description")
    location: str = Field(description="The exact location of the incident")
    summary: str = Field(description="A concise summary of the event")
    key_facts: List[str] = Field(description="A list of key facts critical to the investigation")

FIR_SUMMARIZATION_PROMPT = """
You are an expert police intelligence analyst. Your task is to read the following First Information Report (FIR) or police document and extract key intelligence.

Analyze the text and extract:
1. The primary type of crime.
2. The victim's name or description.
3. The suspect's name or description.
4. The exact location of the incident.
5. A concise summary of the event (2-3 sentences).
6. A list of key facts that are most critical to the investigation.

If a piece of information is missing from the text, return "Unknown" or an empty string, but do not guess. Ensure your output strictly adheres to the requested schema.
"""

# Sample input
RAW_FIR = """On 14th Nov 2024 at around 22:30 hours, complainant Mr. Rajesh Gowda (Ph: 9945123456) reported that his jewelry shop 'Lakshmi Jewellers' in Electronic City Phase 1, Bengaluru, was broken into. Two suspects wearing masks entered by breaking the back shutter. They stole 2kg of gold ornaments worth Rs 1.5 Crores. Suspects escaped in a white Toyota Innova bearing registration KA-51-MD-9088 heading towards Silk Board."""

async def summarize_fir(fir_text: str):
    # Initialize the client using the API key from .env
    client = genai.Client()
    
    print(f"--- 1.1 FIR SUMMARIZATION ---\n")
    print(f"INPUT RAW FIR:\n{fir_text}\n")
    print(f"PROCESSING...\n")
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{FIR_SUMMARIZATION_PROMPT}\n\nHere is the FIR text:\n\n{fir_text}",
            config={
                'response_mime_type': 'application/json',
                'response_schema': SummaryOutput,
                'temperature': 0.0
            }
        )
        
        # Parse and print the output in exact JSON format
        result_json = json.loads(response.text)
        print("OUTPUT JSON:")
        print(json.dumps(result_json, indent=2))
        
    except Exception as e:
        print(f"Error during summarization: {e}")

if __name__ == "__main__":
    asyncio.run(summarize_fir(RAW_FIR))
