import jwt
from fastapi import HTTPException, Request, WebSocket, WebSocketDisconnect
import os
from datetime import datetime
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from storage.redis import get_redis_client
from storage.redis import redis_client
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
        
    try:
        # Get JWT secret key from environment
        jwt_secret = os.getenv("JWT_SECRET")
        if not jwt_secret:
            raise HTTPException(status_code=500, detail="JWT_SECRET not configured")
            
        # Decode and verify the token
        decoded_token = jwt.decode(
            token, 
            str(jwt_secret),
            algorithms=["HS256"],
            options={
                "verify_exp": True,  # Verify expiration
                "verify_iat": True,  # Verify issued at
                "require_exp": True  # Require expiration time
            }
        )
        
        # Extract user_id from decoded token
        user_id = decoded_token.get('user_id')
        if not user_id:
            return None
            
        # Verify token exists in Redis
        stored_token = redis_client.get(f"token:{user_id}")
        if not stored_token or stored_token.decode() != token:
            return None
            
        return user_id
        
    except jwt.ExpiredSignatureError:
        # Clean up expired token from Redis if it exists
        if 'user_id' in decoded_token:
            redis_client.delete(f"token:{decoded_token['user_id']}")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token error: {str(e)}")
        return None
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None