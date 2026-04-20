import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_conn
from auth import jwt_required
from supabase_client import supabase

# Setting up logging to catch the exact error in Render Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 1. DYNAMIC CORS CONFIGURATION
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    os.environ.get("FRONTEND_ORIGIN") # https://edumanage-lime.vercel.app
]
allowed_origins = [origin for origin in allowed_origins if origin is not None]

CORS(app, 
     supports_credentials=True, 
     origins=allowed_origins,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

PROJECT_FIELDS = [
    'Project Title', 'Project ID', 'Project Domain', 'Subject', 'Major/Minor',
    'Publication Type', 'Status', 'Student Names', 'Student Emails', 'Student Phones',
    'Student Roll Numbers', 'Student PRNs', 'Student Division', 'Student Semester',
    'Student Year', 'Student Department', 'Guide Name', 'Guide ID', 'Guide Department', 'Guide Email'
]

# Helper to strictly cast Integers to match your Supabase schema
def clean_project_data(data):
    cleaned = {}
    for field in PROJECT_FIELDS:
        val = data.get(field)
        if field in ['Student Semester', 'Student Year']:
            if val is None or str(val).strip() == "":
                cleaned[field] = None
            else:
                try:
                    cleaned[field] = int(val) # Strict Integer casting
                except (ValueError, TypeError):
                    cleaned[field] = None
        else:
            cleaned[field] = val
    return cleaned

# --- ROUTES ---

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "success", "message": "EduManage API v1.0"})

@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    data = request.get_json()
    token = data.get('access_token')
    if not token:
        return jsonify(status="error", message="Missing token"), 400
    try:
        user_resp = supabase.auth.get_user(token)
        user = user_resp.user if hasattr(user_resp, 'user') else user_resp
        return jsonify({
            "status": "success",
            "name": user.user_metadata.get('full_name', 'Professor'),
            "professor_id": user.id
        })
    except Exception as e:
        logger.error(f"Auth Error: {e}")
        return jsonify(status="error", message=str(e)), 500

@app.route("/api/get_projects", methods=["GET"])
def get_projects():
    try:
        conn = get_conn()
        from psycopg2.extras import RealDictCursor
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Table name is lowercase projects, but Project ID has a space
            cur.execute('SELECT * FROM "projects" ORDER BY "Project ID" DESC')
            projects = cur.fetchall()
        conn.close()
        return jsonify(status="success", projects=projects)
    except Exception as e:
        logger.error(f"DATABASE ERROR in get_projects: {str(e)}", exc_info=True)
        return jsonify(status="error", message="Failed to fetch projects"), 500

@app.route("/api/add_project", methods=["POST"])
def add_project():
    data = clean_project_data(request.get_json())
    params = [data.get(field) for field in PROJECT_FIELDS]
    cols = ", ".join([f'"{f}"' for f in PROJECT_FIELDS])
    placeholders = ", ".join(["%s"] * len(PROJECT_FIELDS))
    sql = f'INSERT INTO "projects" ({cols}) VALUES ({placeholders})'
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
        return jsonify(status="success", message="Project added successfully")
    except Exception as e:
        logger.error(f"DATABASE ERROR in add_project: {e}")
        return jsonify(status="error", message=str(e)), 500

@app.route("/api/update_project", methods=["POST"])
def update_project():
    data = clean_project_data(request.get_json())
    project_id = data.get('Project ID')
    if not project_id:
        return jsonify(status="error", message="Project ID required"), 400
    
    update_parts = [f'"{f}" = %s' for f in PROJECT_FIELDS if f != 'Project ID']
    params = [data.get(f) for f in PROJECT_FIELDS if f != 'Project ID']
    params.append(project_id)
    
    sql = f'UPDATE "projects" SET {", ".join(update_parts)} WHERE "Project ID" = %s'
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
        return jsonify(status="success", message="Project updated")
    except Exception as e:
        logger.error(f"DATABASE ERROR in update_project: {e}")
        return jsonify(status="error", message=str(e)), 500

@app.route("/api/delete_project", methods=["POST"])
def delete_project():
    data = request.get_json()
    project_id = data.get('Project ID')
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute('DELETE FROM "projects" WHERE "Project ID" = %s', (project_id,))
            conn.commit()
        return jsonify(status="success", message="Project deleted")
    except Exception as e:
        logger.error(f"DATABASE ERROR in delete_project: {e}")
        return jsonify(status="error", message=str(e)), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)