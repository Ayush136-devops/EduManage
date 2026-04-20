import os
from urllib.parse import urlparse
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    """Establishes and returns a connection to the Supabase PostgreSQL database."""
    db_url = os.environ.get('DATABASE_URL')
    
    if not db_url:
        raise RuntimeError("DATABASE_URL not found in environment variables. Make sure to set it in your deployment platform.")

    try:
        result = urlparse(db_url)
        conn = psycopg2.connect(
            database=result.path.lstrip('/'),
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port,
            sslmode='require'
        )
        return conn
    except psycopg2.Error as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Database connection failed: {e}")
        raise