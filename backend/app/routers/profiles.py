from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    university: Optional[str] = None

@router.get("/me")
async def get_my_profile(authorization: str = Header(...)):
    """
    Fetches the authenticated student's profile from public.profiles.
    Expects Bearer token in Authorization header.
    """
    token = authorization.replace("Bearer ", "").strip()
    supabase = get_supabase()
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user_res.user.id
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return profile_res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/me")
async def update_my_profile(req: ProfileUpdateRequest, authorization: str = Header(...)):
    """
    Updates the authenticated student's profile and preferred language.
    """
    token = authorization.replace("Bearer ", "").strip()
    supabase = get_supabase()
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user_res.user.id
        update_data = {}
        if req.full_name is not None:
            update_data["full_name"] = req.full_name
        if req.preferred_language is not None:
            update_data["preferred_language"] = req.preferred_language
        if req.university is not None:
            update_data["university"] = req.university

        update_data["updated_at"] = "now()"

        profile_res = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        return {
            "message": "Profile updated successfully",
            "data": profile_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
