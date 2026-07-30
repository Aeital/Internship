from pydantic import BaseModel, EmailStr
class LoginRequest(BaseModel):
    user_email: EmailStr
    password: str
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer" #successful json response
class TokenPayload(BaseModel):
    emp_id: int
    role: str #data encrypted in jwt
    #A Bearer Token is a security token that grants access to anyone who holds it
