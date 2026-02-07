import os
from urllib.parse import urlparse
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    """Returns a new connection to the Supabase Postgres database."""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError("DATABASE_URL not found in .env file")

    result = urlparse(db_url)
    conn = psycopg2.connect(
        database=result.path.lstrip('/'),
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port,
        sslmode='require' # Required for Supabase connections
    )
    return conn