from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/events", tags=["Event Management"])

class EventCreateRequest(BaseModel):
    title: str
    description: str
    location: str
    event_date: datetime
    organizer: str
    category: Optional[str] = "cultural"
    capacity: Optional[int] = 50

class EventRegisterRequest(BaseModel):
    student_name: str
    student_email: EmailStr

@router.get("")
async def list_events(category: Optional[str] = Query(None)):
    """
    Lists upcoming events with optional category filtering.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("events").select("*").order("event_date", desc=False)
        if category and category != "all":
            query = query.eq("category", category)
        res = query.execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("")
async def create_event(req: EventCreateRequest, authorization: Optional[str] = Header(None)):
    """
    Publishes a new campus or cultural event.
    """
    supabase = get_supabase()
    try:
        res = supabase.table("events").insert({
            "title": req.title,
            "description": req.description,
            "location": req.location,
            "event_date": req.event_date.isoformat(),
            "organizer": req.organizer,
            "category": req.category,
            "capacity": req.capacity,
            "registered_count": 0
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{event_id}/register")
async def register_for_event(
    event_id: str,
    req: EventRegisterRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Registers a student for a specific event.
    """
    supabase = get_supabase()
    user_id = None

    if authorization:
        try:
            token = authorization.replace("Bearer ", "").strip()
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user_id = user_res.user.id
        except Exception:
            pass

    try:
        # Check event capacity
        ev = supabase.table("events").select("capacity, registered_count").eq("id", event_id).single().execute()
        if not ev.data:
            raise HTTPException(status_code=404, detail="Event not found")

        cap = ev.data.get("capacity", 50)
        curr = ev.data.get("registered_count", 0)
        if curr >= cap:
            raise HTTPException(status_code=400, detail="This event has reached full capacity.")

        # Record registration
        reg_res = supabase.table("event_registrations").insert({
            "event_id": event_id,
            "user_id": user_id,
            "student_name": req.student_name,
            "student_email": req.student_email
        }).execute()

        # Increment count
        supabase.table("events").update({"registered_count": curr + 1}).eq("id", event_id).execute()

        return {
            "message": "Registration successful! You have secured your spot.",
            "event_id": event_id,
            "registered_count": curr + 1
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
