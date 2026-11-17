from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.supabase_client import get_supabase
from app.services.rag_service import query_rag_assistant

router = APIRouter(prefix="/api/chat", tags=["AI Student Assistant"])

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"

class FeedbackRequest(BaseModel):
    message_id: Optional[str] = None
    rating: int  # 1 to 5
    comment: Optional[str] = ""

@router.post("/message")
async def send_chat_message(
    req: ChatMessageRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Sends question to the Multilingual AI Assistant.
    Retrieves vector knowledge from pgvector, calls Groq LLM, and formats with source citations.
    """
    clean_msg = req.message.strip()
    if not clean_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    supabase = get_supabase()
    user_id = None
    session_id = req.session_id

    # Check authentication if token provided
    if authorization:
        try:
            token = authorization.replace("Bearer ", "").strip()
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user_id = user_res.user.id
        except Exception:
            pass

    # Load recent conversation history if session_id is provided
    history = []
    if session_id:
        try:
            msg_res = supabase.table("chat_messages").select(
                "role, content"
            ).eq("session_id", session_id).order("created_at", desc=False).limit(6).execute()
            if msg_res.data:
                history = msg_res.data
        except Exception as e:
            print(f"[Chat] History load error: {e}")
    elif user_id:
        # Create a new session for authenticated user
        try:
            sess_res = supabase.table("chat_sessions").insert({
                "user_id": user_id,
                "title": clean_msg[:40] + ("..." if len(clean_msg) > 40 else ""),
                "language": req.language
            }).execute()
            if sess_res.data:
                session_id = sess_res.data[0]["id"]
        except Exception as e:
            print(f"[Chat] Session creation error: {e}")

    # Query RAG Assistant (Groq API + Vector Search)
    try:
        rag_result = await query_rag_assistant(
            user_query=clean_msg,
            chat_history=history,
            preferred_language=req.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    answer_text = rag_result["answer"]
    sources = rag_result["sources"]

    # Save to database if session exists
    saved_msg_id = None
    if session_id:
        try:
            # User message
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "user",
                "content": clean_msg
            }).execute()

            # Assistant response with sources
            asst_res = supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "assistant",
                "content": answer_text,
                "sources": sources
            }).execute()

            if asst_res.data:
                saved_msg_id = asst_res.data[0]["id"]
        except Exception as e:
            print(f"[Chat] Message persist error: {e}")

    return {
        "session_id": session_id,
        "message_id": saved_msg_id,
        "role": "assistant",
        "answer": answer_text,
        "sources": sources,
        "model": rag_result.get("model")
    }

@router.get("/sessions")
async def get_user_chat_sessions(authorization: str = Header(...)):
    """
    Lists chat sessions for the authenticated student.
    """
    token = authorization.replace("Bearer ", "").strip()
    supabase = get_supabase()
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        res = supabase.table("chat_sessions").select(
            "id, title, language, created_at"
        ).eq("user_id", user_res.user.id).order("created_at", desc=True).execute()

        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/feedback")
async def submit_feedback(
    req: FeedbackRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Submits student feedback (rating 1-5 and optional comment) on AI responses.
    """
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

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
        supabase.table("feedback").insert({
            "message_id": req.message_id,
            "user_id": user_id,
            "rating": req.rating,
            "comment": req.comment
        }).execute()
        return {"message": "Thank you for your feedback!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
