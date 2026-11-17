import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    GROQ_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

def get_cors_origins() -> List[str]:
    return [url.strip() for url in settings.FRONTEND_URL.split(",") if url.strip()]
