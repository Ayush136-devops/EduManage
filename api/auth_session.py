from functools import wraps
from flask import session, jsonify


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'professor_id' not in session:
            return jsonify(status='error', message='Unauthorized'), 401
        return func(*args, **kwargs)
    return wrapper
