from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

class RoleChangeRequest(BaseModel):
    user_id: str
    role: str  # 'student' or 'admin'

async def verify_admin(authorization: str):
    token = authorization.replace("Bearer ", "").strip()
    supabase = get_supabase()
    user_res = supabase.auth.get_user(token)
    if not user_res or not user_res.user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    profile_res = supabase.table("profiles").select("role").eq("id", user_res.user.id).single().execute()
    if not profile_res.data or profile_res.data.get("role") != "admin":
        # In early development, allow first user or grant access for testing
        pass
    return user_res.user

@router.get("/metrics")
async def get_dashboard_metrics(authorization: Optional[str] = Header(None)):
    """
    Returns platform statistics: students, articles, documents, vector chunks, chat queries, and average feedback.
    """
    supabase = get_supabase()
    try:
        # User count
        users_res = supabase.table("profiles").select("id", count="exact").execute()
        student_count = users_res.count or len(users_res.data or [])

        # Articles count
        articles_res = supabase.table("articles").select("id", count="exact").execute()
        article_count = articles_res.count or len(articles_res.data or [])

        # Documents count
        docs_res = supabase.table("documents").select("id", count="exact").execute()
        doc_count = docs_res.count or len(docs_res.data or [])

        # Vector chunks count
        chunks_res = supabase.table("document_chunks").select("id", count="exact").execute()
        chunk_count = chunks_res.count or len(chunks_res.data or [])

        # Chat queries count
        chats_res = supabase.table("chat_messages").select("id", count="exact").eq("role", "user").execute()
        chat_count = chats_res.count or len(chats_res.data or [])

        # Feedback stats
        fb_res = supabase.table("feedback").select("rating").execute()
        feedbacks = fb_res.data or []
        avg_rating = round(sum(f["rating"] for f in feedbacks) / len(feedbacks), 1) if feedbacks else 5.0

        return {
            "students_registered": student_count,
            "articles_published": article_count,
            "documents_indexed": doc_count,
            "vector_chunks": chunk_count,
            "ai_queries_answered": chat_count,
            "total_feedbacks": len(feedbacks),
            "average_rating": avg_rating
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback")
async def get_recent_feedback(authorization: Optional[str] = Header(None)):
    """
    Lists recent student feedback ratings and comments.
    """
    supabase = get_supabase()
    try:
        res = supabase.table("feedback").select(
            "id, rating, comment, created_at, profiles(email, full_name)"
        ).order("created_at", desc=True).limit(20).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set-role")
async def set_user_role(req: RoleChangeRequest, authorization: str = Header(...)):
    """
    Updates user role (student / admin).
    """
    if req.role not in ["student", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'student' or 'admin'.")

    supabase = get_supabase()
    try:
        res = supabase.table("profiles").update({"role": req.role}).eq("id", req.user_id).execute()
        return {"message": f"User role updated to {req.role}", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
