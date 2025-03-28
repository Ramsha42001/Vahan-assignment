from fastapi import HTTPException
from storage.db import get_async_database
from storage.redis import get_redis_client
from schema.user import UserSignup
import uuid
from datetime import datetime
from passlib.context import CryptContext
from services.login import create_access_token
from services.login import ACCESS_TOKEN_EXPIRE_MINUTES
from services.login import pwd_context

async def get_password_hash(password: str):
    return pwd_context.hash(password)

async def signup_user(user_data: UserSignup):
    # Check if user already exists
    db = get_async_database()
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", user_data.email).limit(1)
    results = query.stream()
    
    if any(results):
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": await get_password_hash(user_data.password),
        "documents_uploaded": 0,
        "created_at": datetime.utcnow()
    }
    
    # Save user to Firestore
    users_ref.document(user_id).set(user_doc)
    
    # Create access token
    access_token = await create_access_token({"user_id": user_id})
    
    # Store token in Redis for verification
    redis_client = get_redis_client()
    redis_client.set(access_token, user_id, ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60)  # Expire in Redis too
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id
    }