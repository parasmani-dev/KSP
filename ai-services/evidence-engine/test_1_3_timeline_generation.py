import asyncio
import json
import logging
from google import genai
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

class TimelineEvent(BaseModel):
    timestamp: str
    description: str

class TimelineOutput(BaseModel):
    events: List[TimelineEvent]

TIMELINE_GENERATION_PROMPT = """
You are an expert police intelligence analyst. Reconstruct a chronological timeline of events from the provided document text.
Extract every event that has an associated time or logical sequence. Provide the timestamp (or relative time) and a description of the event.
"""

# Sample input based on the ideation document
RAW_TEXT = """
Victim left home from Jayanagar at 08:00 PM. A suspicious vehicle was spotted by witnesses near BTM Layout around 08:45 PM. 
The theft at the victim's residence was discovered and reported to neighbors at 09:10 PM. 
The victim called the police helpline at 09:45 PM. First responders arrived at the scene at 10:15 PM.
"""

async def generate_timeline(text: str):
    # Initialize the client using the API key from .env
    client = genai.Client()
    
    print(f"--- 1.3 TIMELINE GENERATION ---\n")
    print(f"INPUT RAW TEXT:\n{text}\n")
    print(f"PROCESSING...\n")
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{TIMELINE_GENERATION_PROMPT}\n\nDocument ID: DOC-001\n\nText:\n{text}",
            config={
                'response_mime_type': 'application/json',
                'response_schema': TimelineOutput,
                'temperature': 0.0
            }
        )
        
        # Parse and print the output in exact JSON format
        result_json = json.loads(response.text)
        print("OUTPUT JSON:")
        print(json.dumps(result_json, indent=2))
        
    except Exception as e:
        print(f"Error during timeline generation: {e}")

if __name__ == "__main__":
    asyncio.run(generate_timeline(RAW_TEXT))
