import asyncio
import json
import logging
from google import genai
from pydantic import BaseModel, Field
from typing import List
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

# Schema exactly matching the user's requested output
class ExtractionOutput(BaseModel):
    persons: List[str] = Field(default_factory=list, description="List of persons extracted")
    locations: List[str] = Field(default_factory=list, description="List of locations extracted")
    vehicles: List[str] = Field(default_factory=list, description="List of vehicles extracted")
    phone_numbers: List[str] = Field(default_factory=list, description="List of phone numbers extracted")
    bank_accounts: List[str] = Field(default_factory=list, description="List of bank accounts extracted")
    dates: List[str] = Field(default_factory=list, description="List of dates extracted")
    times: List[str] = Field(default_factory=list, description="List of times extracted")
    organizations: List[str] = Field(default_factory=list, description="List of organizations extracted")

ENTITY_EXTRACTION_PROMPT = """
You are an expert NLP system for law enforcement. Extract all relevant entities from the provided police document text.
Categories include 'Persons', 'Locations', 'Vehicles', 'Phone Numbers', 'Bank Accounts', 'Dates', 'Times', and 'Organizations'.
Ensure your output strictly adheres to the requested schema. If an entity type is not found, return an empty list for that type.
"""

# Sample input
RAW_TEXT = """Ravi Kumar was seen driving KA01AB1234 near Whitefield."""

async def extract_entities(text: str):
    # Initialize the client using the API key from .env
    client = genai.Client()
    
    print(f"--- 1.2 ENTITY EXTRACTION ---\n")
    print(f"INPUT RAW TEXT:\n{text}\n")
    print(f"PROCESSING...\n")
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{ENTITY_EXTRACTION_PROMPT}\n\nDocument ID: DOC-001\n\nText:\n{text}",
            config={
                'response_mime_type': 'application/json',
                'response_schema': ExtractionOutput,
                'temperature': 0.0
            }
        )
        
        # Parse and print the output in exact JSON format
        result_json = json.loads(response.text)
        print("OUTPUT JSON:")
        print(json.dumps(result_json, indent=2))
        
    except Exception as e:
        print(f"Error during extraction: {e}")

if __name__ == "__main__":
    asyncio.run(extract_entities(RAW_TEXT))
