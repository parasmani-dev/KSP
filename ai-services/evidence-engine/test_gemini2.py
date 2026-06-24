import os
from google import genai
from pydantic import BaseModel

class TestSchema(BaseModel):
    message: str

def test_genai():
    try:
        client = genai.Client(api_key="AQ.Ab8RN6JfQpLpAdJMTU32f0HqEDgomQ32XnxJWFIAruoAoZm_Kw")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Say hello',
            config={
                'response_mime_type': 'application/json',
                'response_schema': TestSchema,
            },
        )
        print("Success:", response.text)
    except Exception as e:
        print("Error:", e)

test_genai()
