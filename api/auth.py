from functools import wraps
from flask import request, jsonify, g
from supabase_client import supabase

def jwt_required(f):
    """Decorator to protect routes using Supabase JWT tokens."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        
        if not token:
            return jsonify(status="error", message="Authentication token missing"), 401
        
        try:
            # Verify token directly with Supabase Auth
            user_resp = supabase.auth.get_user(token)
            user = user_resp.user if hasattr(user_resp, 'user') else user_resp
            
            if not user:
                return jsonify(status="error", message="Invalid token"), 401
            
            # Save user email to 'g' for use inside the route if needed
            g.user_email = user.email
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify(status="error", message="Session expired or invalid"), 401
            
    return decorated