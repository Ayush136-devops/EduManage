import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_conn
from auth import jwt_required
from supabase_client import supabase

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")])

# Fields matching the projects_database_100_entries.csv structure
PROJECT_FIELDS = [
    'Project Title', 'Project ID', 'Project Domain', 'Subject', 'Major/Minor',
    'Publication Type', 'Status', 'Student Names', 'Student Emails', 'Student Phones',
    'Student Roll Numbers', 'Student PRNs', 'Student Division', 'Student Semester',
    'Student Year', 'Student Department', 'Guide Name', 'Guide ID', 'Guide Department', 'Guide Email'
]

@app.route("/api/get_projects", methods=["GET"])
def get_projects():
    """Fetches all projects for the dashboard."""
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
    """Adds a new project entry to the database."""
    data = request.get_json()
    params = [data.get(field) for field in PROJECT_FIELDS]
    
    cols = ", ".join([f'"{f}"' for f in PROJECT_FIELDS])
    placeholders = ", ".join(["%s"] * len(PROJECT_FIELDS))
    sql = f"INSERT INTO projects ({cols}) VALUES ({placeholders})"

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
        return jsonify(status="success", message="Project added successfully")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "EduManage Backend is officially online!",
        "database_connected": True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)