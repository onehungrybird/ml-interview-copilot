from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ML Interview Copilot"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Anthropic
    # ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Supabase (we'll fill these later)
    SUPABASE_URL: str = "https://gjvwiswzzyotwydvzpjv.supabase.co"
    SUPABASE_KEY: str = "sb_publishable_p1qfg8zttbkUh8ZlUP2Jhw_9sh0EIqn"
    SUPABASE_SERVICE_KEY: str ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqdndpc3d6enlvdHd5ZHZ6cGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDAyMDksImV4cCI6MjA4OTc3NjIwOX0.7AHpnW_dcq7GdOW-tHHeKfLPteKMEsYkudYxOHWW4tQ"
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()