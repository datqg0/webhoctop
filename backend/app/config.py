import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DP EXAM | AI Practice"
    API_V1_STR: str = "/api"
    
    # Database (Neon Postgres or fallback SQLite)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./exam_system.db")
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.8-flash")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")

    # Used for text generation when Gemini is missing or unavailable.
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Set these in the deployment environment to enable the admin account.
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    ADMIN_TOKEN_SECRET: str = os.getenv("ADMIN_TOKEN_SECRET", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        "*"
    ]
    
    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
