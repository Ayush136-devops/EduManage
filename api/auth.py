from functools import wraps
from flask import request, jsonify, g
from supabase_client import supabase

def jwt_required(f):
    """Decorator to protect routes by verifying the Supabase JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        
        if not token:
            return jsonify(status="error", message="Authentication token missing"), 401
        
        try:
            # Verify the token with Supabase Auth
            user_resp = supabase.auth.get_user(token)
            user = user_resp.user if hasattr(user_resp, 'user') else user_resp
            
            if not user:
                return jsonify(status="error", message="Invalid or expired token"), 401
            
            # Store user info for use in routes
            g.user_email = user.email
            return f(*args, **kwargs)
        except Exception:
            return jsonify(status="error", message="Authentication failed"), 401
            
    return decorated