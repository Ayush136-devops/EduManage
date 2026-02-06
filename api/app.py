import os
import uuid
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, request, jsonify, send_from_directory, g, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import psycopg2
from psycopg2.extras import RealDictCursor

from db import get_conn
from supabase_client import supabase, SUPABASE_BUCKET, get_public_url
from auth_session import login_required

# Configuration
ALLOWED_EXT = {"pdf", "doc", "docx"}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", str(uuid.uuid4()))
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# CORS - allow front-end origin and credentials and Authorization header
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, supports_credentials=True, origins=[FRONTEND_ORIGIN], allow_headers=['Content-Type', 'Authorization'])

PROJECT_FIELDS = [
    'Project Title', 'Project ID', 'Project Domain', 'Subject', 'MajorMinor',
    'Publication Type', 'Status', 'Student Names', 'Student Emails', 'Student Phones',
    'Student Roll Numbers', 'Student PRNs', 'Student Division', 'Student Semester',
    'Student Year', 'Student Department', 'Guide Name', 'Guide ID', 'Guide Department', 'Guide Email'
]


@app.route("/api/test_pg", methods=["GET"])  # lightweight connection test
def test_pg():
    try:
        conn = get_conn()
        conn.close()
        return "Connection working!" 
    except Exception as e:
        return f"Connection failed: {e}", 500


# NOTE: password-based registration removed. Please use Google Sign-In via Supabase.


# NOTE: password-based login removed. Use Supabase Google Sign-In.


@app.route("/api/auth/google", methods=["POST"])
def auth_google():
    """Exchange Supabase access token for a server session. Expects { access_token } in JSON body or Authorization header."""
    data = request.get_json(force=True) or {}
    token = data.get('access_token')
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]

    if not token:
        return jsonify(status='error', message='No access token provided'), 400

    try:
        # Verify token with Supabase
        user_resp = supabase.auth.get_user(token)
        user = user_resp.user if hasattr(user_resp, 'user') else user_resp
        if not user:
            return jsonify(status='error', message='Invalid token'), 401
        email = user.email
        name = user.user_metadata.get('full_name') or user.user_metadata.get('name') or user.email.split('@')[0]

        # Restrict to @vit.edu if desired
        if not email.endswith('@vit.edu'):
            return jsonify(status='error', message='Only @vit.edu email addresses are allowed'), 403

        # Create or find professor row
        conn = get_conn()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, name, email FROM professors WHERE email=%s', (email,))
            row = cur.fetchone()
            if not row:
                cur.execute('INSERT INTO professors (name, email) VALUES (%s, %s) RETURNING id, name, email', (name, email))
                row = cur.fetchone()
            # Set server session
            session.clear()
            session['professor_id'] = row['id']
            session['professor_name'] = row['name']
        return jsonify(status='success', name=row['name'], professor_id=row['id'])
    except Exception as e:
        return jsonify(status='error', message=str(e)), 500


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify(status="success", message="Logged out")


@app.route("/api/add_project", methods=["POST"])
@login_required
def add_project():
    data = request.get_json(force=True)
    params = [data.get(f) for f in PROJECT_FIELDS]

    placeholders = ", ".join(["%s"] * len(PROJECT_FIELDS))
    columns = ", ".join([f'"{c}"' for c in PROJECT_FIELDS])
    sql = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"

    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
        return jsonify(status="success", message="Project created")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route("/api/get_projects", methods=["GET"])
def get_projects():
    try:
        conn = get_conn()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM projects ORDER BY "Project ID" DESC')
            projects = cur.fetchall()
        return jsonify(status="success", projects=projects)
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route("/api/update_project", methods=["POST"])
@login_required
def update_project():
    data = request.get_json(force=True)
    project_id = data.get("Project ID")
    if not project_id:
        return jsonify(status="error", message="Project ID required"), 400

    set_clauses = []
    params = []
    for col in PROJECT_FIELDS:
        if col != "Project ID" and col in data:
            set_clauses.append(f'"{col}" = %s')
            params.append(data[col])

    if not set_clauses:
        return jsonify(status="error", message="No fields to update"), 400

    params.append(project_id)
    set_sql = ", ".join(set_clauses)
    sql = f'UPDATE projects SET {set_sql} WHERE "Project ID" = %s'

    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
        return jsonify(status="success", message="Project updated")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route("/api/delete_project", methods=["POST"])
@login_required
def delete_project():
    data = request.get_json(force=True)
    project_id = data.get("Project ID")
    if not project_id:
        return jsonify(status="error", message="Project ID required"), 400

    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute('DELETE FROM projects WHERE "Project ID" = %s', (project_id,))
        return jsonify(status="success", message="Project deleted")
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route("/api/upload_file", methods=["POST"])
@login_required
def upload_file():
    if 'file' not in request.files or 'project_id' not in request.form:
        return jsonify(status="error", message="Invalid request"), 400

    file = request.files['file']
    project_id = request.form['project_id']
    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXT:
        return jsonify(status="error", message="Only PDF, DOC, DOCX allowed"), 400

    new_name = f"file_{uuid.uuid4().hex}.{ext}"
    object_path = f"{project_id}/{new_name}"

    try:
        # Read file bytes and upload to Supabase Storage
        file_bytes = file.read()
        supabase.storage.from_(SUPABASE_BUCKET).upload(object_path, file_bytes)
        public_url = get_public_url(object_path)

        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO project_files (project_id, file_name, file_type, file_path) VALUES (%s, %s, %s, %s)",
                    (project_id, filename, ext, public_url)
                )
        return jsonify(status="success", file=new_name, url=public_url)
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    # Files are stored in Supabase Storage. Redirect client to the public URL.
    public_url = get_public_url(filename)
    return jsonify(status="redirect", url=public_url), 302


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=os.environ.get('FLASK_DEBUG', '0') == '1')
