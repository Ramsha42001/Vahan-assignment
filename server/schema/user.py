from pydantic import BaseModel, Field

class UserSignup(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str