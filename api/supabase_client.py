import os
import logging
from supabase import create_client
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Initialize environment variables from .env
load_dotenv()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
SUPABASE_BUCKET = os.environ.get('SUPABASE_BUCKET', 'uploads')

# Initialize the Supabase client (will be None if env vars are missing)
supabase = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info('Supabase client initialized successfully')
    except Exception as e:
        logger.error(f'Failed to initialize Supabase client: {e}')
else:
    logger.warning('SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment')

def get_public_url(object_path: str) -> str:
    """Generates the public URL for a file stored in Supabase Storage."""
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{object_path}"