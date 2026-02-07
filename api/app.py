import os
import uuid
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from db import get_conn
from auth import jwt_required
from supabase_client import supabase, SUPABASE_BUCKET, get_public_url

app = Flask(__name__)

# Allow your React frontend to communicate with this API
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, supports_credentials=True, origins=[FRONTEND_ORIGIN])

# Exact headers from your projects_database_100_entries.csv
PROJECT_FIELDS = [
    'Project Title', 'Project ID', 'Project Domain', 'Subject', 'Major/Minor',
    'Publication Type', 'Status', 'Student Names', 'Student Emails', 'Student Phones',
    'Student Roll Numbers', 'Student PRNs', 'Student Division', 'Student Semester',
    'Student Year', 'Student Department', 'Guide Name', 'Guide ID', 'Guide Department', 'Guide Email'
]

@app.route("/api/auth/google", methods=["POST"])
def auth_google():
    """Exchanges Supabase token for a profile confirmation and restricts by domain."""
    data = request.get_json() or {}
    token = data.get('access_token')
    
    try:
        user_resp = supabase.auth.get_user(token)
        user = user_resp.user if hasattr(user_resp, 'user') else user_resp
        
        if not user.email.endswith('@vit.edu'):
            return jsonify(status='error', message='Access restricted to @vit.edu'), 403

        # Sync professor to database
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO professors (name, email) VALUES (%s, %s) 
                ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id
            """, (user.user_metadata.get('full_name'), user.email))
            prof_id = cur.fetchone()[0]
            conn.commit()
            
        return jsonify(status='success', name=user.user_metadata.get('full_name'), professor_id=prof_id)
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500

@app.route("/api/get_projects", methods=["GET"])
def get_projects():
    """Fetches all projects for the dashboard and analytics."""
    try:
        conn = get_conn()
        from psycopg2.extras import RealDictCursor
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM projects ORDER BY "Project ID" DESC')
            projects = cur.fetchall()
        return jsonify(status="success", projects=projects)
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

@app.route("/api/add_project", methods=["POST"])
@jwt_required
def add_project():
    """Protected route to add a new project."""
    data = request.get_json()
    params = [data.get(f) for f in PROJECT_FIELDS]
    
    columns = ", ".join([f'"{c}"' for c in PROJECT_FIELDS])
    placeholders = ", ".join(["%s"] * len(PROJECT_FIELDS))
    sql = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
        return jsonify(status="success", message="Project created")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)