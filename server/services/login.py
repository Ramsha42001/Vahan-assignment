from fastapi import HTTPException
from storage.db import get_async_database
from storage.redis import redis_client
from schema.user import UserLogin
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import secrets
import jwt

ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def create_access_token(data: dict):
    to_encode = data.copy()
    # Use datetime objects for expiration
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,  # Use datetime object directly, not timestamp
        "iat": datetime.utcnow()  # Add issued at time
    })
    
    secret_key = os.getenv("JWT_SECRET")
    if not secret_key:
        raise HTTPException(status_code=500, detail="JWT_SECRET not configured")
    
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    
    # Store in Redis with the same expiration
    redis_client.set(
        f"token:{data['user_id']}", 
        encoded_jwt, 
        ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return encoded_jwt

async def login_user(user_data: UserLogin):
    db = get_async_database()
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", user_data.email).limit(1)
    results = list(query.stream())
    
    if not results:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    user_doc = results[0].to_dict()
    
    if not await verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    user_id = user_doc.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    access_token = await create_access_token({"user_id": user_id})
    
    redis_client.set(access_token, user_id, ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60) 
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id
    }