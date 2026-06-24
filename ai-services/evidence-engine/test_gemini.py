import asyncio
import os
from openai import AsyncOpenAI
from pydantic import BaseModel

class TestSchema(BaseModel):
    message: str

async def main():
    client = AsyncOpenAI(
        api_key="AQ.Ab8RN6JfQpLpAdJMTU32f0HqEDgomQ32XnxJWFIAruoAoZm_Kw",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    try:
        response = await client.beta.chat.completions.parse(
            model="gemini-1.5-flash",
            messages=[{"role": "user", "content": "Say hello"}],
            response_format=TestSchema
        )
        print("Success:", response.choices[0].message.parsed)
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
