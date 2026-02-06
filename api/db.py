import os
from urllib.parse import urlparse
import psycopg2

_DATABASE_URL = os.environ.get('DATABASE_URL')

if not _DATABASE_URL:
    # Fallback to local development DB; set DATABASE_URL in production
    _DATABASE_URL = os.environ.get('LOCAL_DATABASE_URL', 'postgres://postgres:password@localhost:5432/postgres')


def get_conn():
    """Return a new psycopg2 connection (caller should close it when done)."""
    # Parse URL
    result = urlparse(_DATABASE_URL)
    user = result.username
    password = result.password
    host = result.hostname
    port = result.port
    dbname = result.path.lstrip('/')

    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port,
        sslmode='require' if result.scheme in ('postgres', 'postgresql') else None,
        connect_timeout=10
    )
    return conn
