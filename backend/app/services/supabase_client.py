from supabase import create_client, Client
from app.config import settings

_supabase_client: Client = None
_supabase_admin_client: Client = None

def get_supabase() -> Client:
    """Returns the standard Supabase client (using anon key)."""
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be configured in environment or .env file.")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _supabase_client

def get_supabase_admin() -> Client:
    """Returns the elevated Supabase admin client (using service role key)."""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY must be configured for admin operations.")
        _supabase_admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_admin_client
