import os
import uuid
from pathlib import Path
from urllib.parse import urlparse

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer
from pydantic import BaseModel

bearer_scheme = HTTPBearer()
from db import get_conn
from supabase_client import supabase, SUPABASE_BUCKET, get_public_url


# Helper: verify supabase access token and return user-like object
def verify_supabase_token(token: str):
    try:
        resp = supabase.auth.get_user(token)
        user = resp.user if hasattr(resp, 'user') else resp
        return user
    except Exception:
        return None


def get_current_user_from_token(credentials=Depends(bearer_scheme)):
    token = credentials.credentials
    user = verify_supabase_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

ALLOWED_EXT = {"pdf", "doc", "docx"}

app = FastAPI()
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_FIELDS = [
    'Project Title', 'Project ID', 'Project Domain', 'Subject', 'MajorMinor',
    'Publication Type', 'Status', 'Student Names', 'Student Emails', 'Student Phones',
    'Student Roll Numbers', 'Student PRNs', 'Student Division', 'Student Semester',
    'Student Year', 'Student Department', 'Guide Name', 'Guide ID', 'Guide Department', 'Guide Email'
]


class RegisterModel(BaseModel):
    name: str
    email: str
    password: str


class LoginModel(BaseModel):
    email: str
    password: str


@app.get("/api/test_pg")
def test_pg():
    try:
        conn = get_conn()
        conn.close()
        return "Connection working!"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register_professor")
def register_professor(payload: RegisterModel):
    name = payload.name.strip()
    email = payload.email.strip()
    password = payload.password
    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")
    hashed = __import__('werkzeug.security').security.generate_password_hash(password)
    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM professors WHERE email=%s", (email,))
                if cur.fetchone():
                    raise HTTPException(status_code=400, detail="Email already registered")
                cur.execute("INSERT INTO professors (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed))
        return JSONResponse({"status": "success", "message": "Professor registered!"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/login")
def login(payload: LoginModel):
    # Password login removed — use Supabase Google OAuth instead
    raise HTTPException(status_code=400, detail="Password login removed. Use Google Sign-In.")


@app.post("/api/add_project")
def add_project(payload: dict, current_user=Depends(get_current_user_from_token)):
    params = [payload.get(f) for f in PROJECT_FIELDS]
    placeholders = ", ".join(["%s"] * len(PROJECT_FIELDS))
    columns = ", ".join([f'"{c}"' for c in PROJECT_FIELDS])
    sql = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"
    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
        return {"status": "success", "message": "Project created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/get_projects")
def get_projects():
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM projects ORDER BY "Project ID" DESC')
            cols = [desc[0] for desc in cur.description]
            projects = [dict(zip(cols, row)) for row in cur.fetchall()]
        return {"status": "success", "projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/update_project")
def update_project(payload: dict, current_user=Depends(get_current_user_from_token)):
    project_id = payload.get("Project ID")
    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID required")
    set_clauses = []
    params = []
    for col in PROJECT_FIELDS:
        if col != "Project ID" and col in payload:
            set_clauses.append(f'"{col}" = %s')
            params.append(payload[col])
    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.append(project_id)
    set_sql = ", ".join(set_clauses)
    sql = f'UPDATE projects SET {set_sql} WHERE "Project ID" = %s'
    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
        return {"status": "success", "message": "Project updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/delete_project")
def delete_project(payload: dict, current_user=Depends(get_current_user_from_token)):
    project_id = payload.get("Project ID")
    if not project_id:
        raise HTTPException(status_code=400, detail="Project ID required")
    try:
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute('DELETE FROM projects WHERE "Project ID" = %s', (project_id,))
        return {"status": "success", "message": "Project deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload_file")
async def upload_file(project_id: str = Form(...), file: UploadFile = File(...), current_user=Depends(get_current_user_from_token)):
    filename = file.filename
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, DOCX allowed")
    new_name = f"file_{uuid.uuid4().hex}.{ext}"
    object_path = f"{project_id}/{new_name}"
    try:
        content = await file.read()
        supabase.storage.from_(SUPABASE_BUCKET).upload(object_path, content)
        public_url = get_public_url(object_path)
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO project_files (project_id, file_name, file_type, file_path) VALUES (%s, %s, %s, %s)",
                            (project_id, filename, ext, public_url))
        return {"status": "success", "file": new_name, "url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/uploads/{filename}')
def serve_upload(filename: str):
    # Files are served from Supabase Storage — redirect client to the public URL
    public_url = get_public_url(filename)
    return JSONResponse({"status": "redirect", "url": public_url}, status_code=302)
