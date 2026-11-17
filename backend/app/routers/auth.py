from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = ""
    preferred_language: Optional[str] = "en"
    university: Optional[str] = "National Chi Nan University (NCNU)"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register_user(req: RegisterRequest):
    """
    Registers a new student user via Supabase Auth.
    The database trigger automatically initializes their record in public.profiles.
    """
    supabase = get_supabase()
    try:
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "full_name": req.full_name,
                    "preferred_language": req.preferred_language,
                    "role": "student",
                    "university": req.university
                }
            }
        })
        return {
            "message": "User registered successfully",
            "user": res.user,
            "session": res.session
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login_user(req: LoginRequest):
    """
    Authenticates a user via email and password using Supabase Auth.
    """
    supabase = get_supabase()
    try:
        res = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        return {
            "message": "Login successful",
            "user": res.user,
            "session": res.session
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout_user(authorization: Optional[str] = Header(None)):
    """
    Logs out the current session.
    """
    supabase = get_supabase()
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
