import jwt
from fastapi import HTTPException, Request, WebSocket, WebSocketDisconnect
import os
from datetime import datetime
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from storage.redis import get_redis_client

security = HTTPBearer()

def verify_jwt_token(request: Request = None, websocket: WebSocket = None):
    # Extract token from either HTTP request or WebSocket
    token = None
    
    if request:
        # Regular HTTP request
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    elif websocket:
        # WebSocket connection
        headers = websocket.headers
        auth_header = headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
        
    # Verify token in Redis
    redis_client = get_redis_client()
    user_id = redis_client.get(token)
    if user_id:
        return user_id.decode("utf-8") if isinstance(user_id, bytes) else user_id
    
    return None