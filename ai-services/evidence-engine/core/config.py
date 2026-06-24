from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = ""
    environment: str = "dev"
    
    class Config:
        env_file = ".env"

settings = Settings()
