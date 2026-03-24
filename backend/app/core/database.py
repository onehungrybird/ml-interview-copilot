from supabase import create_client, Client
from app.core.config import settings
from functools import lru_cache

@lru_cache()
def get_db() -> Client:
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )

db = get_db()