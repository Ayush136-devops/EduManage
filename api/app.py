import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_conn
from auth import jwt_required
from supabase_client import supabase

app = Flask(__name__)

# Dynamic CORS Configuration
# Reads FRONTEND_ORIGIN from Render Environment Variables
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    os.environ.get("FRONTEND_ORIGIN") # Allows your live Vercel URL
]

# Clean the list to remove None values if the environment variable isn't set
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

# 1. AUTHENTICATION ROUTE
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
        return jsonify(status="error", message=str(e)), 500

# 2. GET ALL PROJECTS
@app.route("/api/get_projects", methods=["GET"])
def get_projects():
    try:
        conn = get_conn()
        from psycopg2.extras import RealDictCursor
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Added double quotes to "projects" and "Project ID" for Postgres case-sensitivity
            cur.execute('SELECT * FROM "projects" ORDER BY "Project ID" DESC')
            projects = cur.fetchall()
        return jsonify(status="success", projects=projects)
    except Exception as e:
        print(f"DEBUG: Database Error in get_projects: {e}") # Appears in Render Logs
        return jsonify(status="error", message=str(e)), 500

# 3. ADD NEW PROJECT
@app.route("/api/add_project", methods=["POST"])
def add_project():
    data = request.get_json()
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
        return jsonify(status="error", message=str(e)), 500

# 4. UPDATE EXISTING PROJECT
@app.route("/api/update_project", methods=["POST"])
def update_project():
    data = request.get_json()
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
        return jsonify(status="error", message=str(e)), 500

# 5. DELETE PROJECT
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
        return jsonify(status="error", message=str(e)), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "success", "message": "EduManage API v1.0"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)