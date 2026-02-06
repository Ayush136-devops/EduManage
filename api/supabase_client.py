import os
from supabase import create_client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
SUPABASE_BUCKET = os.environ.get('SUPABASE_BUCKET', 'uploads')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_public_url(object_path: str) -> str:
    # Public URL format for Supabase Storage
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{object_path}"
