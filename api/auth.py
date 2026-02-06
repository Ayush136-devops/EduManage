import os
from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import request, jsonify, g
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))  # 7 days

# Flask helpers

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except Exception:
        raise


def _get_token_from_flask_request():
    # Look for Bearer token in Authorization header or cookie named 'access_token'
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1]
    token = request.cookies.get("access_token")
    return token


def jwt_required_flask(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _get_token_from_flask_request()
        if not token:
            return jsonify(status="error", message="Unauthorized"), 401
        try:
            payload = decode_token(token)
            g.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify(status="error", message="Token expired"), 401
        except Exception:
            return jsonify(status="error", message="Invalid token"), 401
        return func(*args, **kwargs)
    return wrapper


# FastAPI helpers
bearer_scheme = HTTPBearer()


def get_current_user_from_token(credentials=Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
