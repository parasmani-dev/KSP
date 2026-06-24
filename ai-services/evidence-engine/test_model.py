import asyncio
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client()

async def test_model():
    print("Testing gemini-flash-latest...")
    try:
        response = await client.aio.models.generate_content(
            model='gemini-flash-latest',
            contents="Say hi"
        )
        print("Success!", response.text)
    except Exception as e:
        print("Error:", e)

asyncio.run(test_model())
