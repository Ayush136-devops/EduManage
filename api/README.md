# Edumanage API (Flask)

This folder contains a Flask reimplementation of the original PHP API endpoints.

## Endpoints
- `POST /api/register_professor` — register a professor (name, email, password)
- `POST /api/login` — login (email, password) — sets a session cookie
- `POST /api/logout` — logout (clears session)
- `GET  /api/test_pg` — returns DB connection status
- `POST /api/add_project` — accepts JSON containing project fields
- `GET  /api/get_projects` — returns all projects
- `POST /api/update_project` — update project by `Project ID` and provided fields
- `POST /api/delete_project` — delete project by `Project ID`
- `POST /api/upload_file` — multipart upload (file and project_id)
- `GET  /uploads/<filename>` — serve files from `uploads/` (use with caution)

## Quick start (development)

1. Create a Python venv and activate it:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate    # Windows
   source .venv/bin/activate   # macOS / Linux
   ```

2. Install deps:
   ```bash
   pip install -r requirements.txt
   ```

3. Set environment variables (example):
   - `DATABASE_URL` — your Postgres connection string (ex: `postgres://user:pass@host:5432/dbname`)
   - `FRONTEND_ORIGIN` — URL of your frontend (default `http://localhost:3000`)
   - `SECRET_KEY` — (optional) set a fixed session secret

4. Run the app:
   ```bash
   set DATABASE_URL=your_db_url        # Windows (PowerShell)
   set FLASK_DEBUG=1
   python app.py
   ```

## Docker
Build and run with Docker:

```bash
docker build -t edumanage-api .
docker run -e DATABASE_URL="$DATABASE_URL" -p 8000:8000 edumanage-api
```

## JWT Auth & FastAPI
- This project now uses **JWT** tokens instead of server-side filesystem sessions. The login endpoints return an `access_token` which clients should store (e.g., in memory or localStorage) and send as `Authorization: Bearer <token>` on protected requests.
- Protected endpoints: `add_project`, `update_project`, `delete_project`, and `upload_file` require a valid JWT.
- A FastAPI ASGI app is included (`app_fastapi.py`) for serverless-friendly deployments (Vercel). The FastAPI version exposes the same endpoints and uses bearer tokens for auth.

## Deploying
- Render: continue deploying the Flask `app.py` service (Gunicorn start). Set `DATABASE_URL`, `SECRET_KEY`, and `FRONTEND_ORIGIN`.
- Vercel: prefer deploying `app_fastapi.py` as serverless functions or a single ASGI deployment. Ensure `DATABASE_URL` points to Supabase Postgres and you use Supabase Storage for persistent files (serverless instances have ephemeral storage).

## Notes & Next steps
- Sessions are replaced by JWTs for stateless auth. If you need token revocation, add a blacklist store (Redis) or short token lifetimes with refresh tokens.
- Replace filesystem uploads with Supabase Storage for persistent file hosting (recommended for both Render and Vercel). Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` and `SUPABASE_BUCKET` in environment variables. The backend will upload files to Supabase Storage and store a public URL in `project_files.file_path`.
- Add input validation, pagination for `get_projects`, and tests.
- The DB schema expects the same tables as in the original PHP version (`projects`, `professors`, `project_files`).
- Adjust CORS origin via `FRONTEND_ORIGIN` environment variable.
