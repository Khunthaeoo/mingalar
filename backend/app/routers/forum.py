from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional, List
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/forum", tags=["Community Forum"])

class PostCreateRequest(BaseModel):
    title: str
    content: str
    category: Optional[str] = "general"
    author_name: Optional[str] = "Anonymous Student"
    language: Optional[str] = "en"

class CommentCreateRequest(BaseModel):
    content: str
    author_name: Optional[str] = "Fellow Student"

@router.get("/posts")
async def list_posts(
    category: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
):
    """
    Lists community forum posts with category filtering and keyword search.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("forum_posts").select(
            "id, user_id, author_name, category, title, content, language, likes_count, created_at, forum_comments(count)"
        )

        if category and category != "all":
            query = query.eq("category", category)

        if language:
            query = query.eq("language", language)

        if q:
            query = query.or_(f"title.ilike.%{q}%,content.ilike.%{q}%")

        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/posts")
async def create_post(req: PostCreateRequest, authorization: Optional[str] = Header(None)):
    """
    Creates a new student forum post.
    """
    supabase = get_supabase()
    user_id = None
    author = req.author_name

    if authorization:
        try:
            token = authorization.replace("Bearer ", "").strip()
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user_id = user_res.user.id
                prof_res = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
                if prof_res.data and prof_res.data.get("full_name"):
                    author = prof_res.data["full_name"]
        except Exception:
            pass

    try:
        res = supabase.table("forum_posts").insert({
            "user_id": user_id,
            "author_name": author,
            "category": req.category,
            "title": req.title,
            "content": req.content,
            "language": req.language
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/posts/{post_id}")
async def get_post_detail(post_id: str):
    """
    Gets post details with its comment thread.
    """
    supabase = get_supabase()
    try:
        post_res = supabase.table("forum_posts").select("*").eq("id", post_id).single().execute()
        if not post_res.data:
            raise HTTPException(status_code=404, detail="Post not found")

        comments_res = supabase.table("forum_comments").select(
            "id, author_name, content, created_at"
        ).eq("post_id", post_id).order("created_at", desc=False).execute()

        data = post_res.data
        data["comments"] = comments_res.data or []
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    req: CommentCreateRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Adds a reply comment to a forum post.
    """
    supabase = get_supabase()
    user_id = None
    author = req.author_name

    if authorization:
        try:
            token = authorization.replace("Bearer ", "").strip()
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user_id = user_res.user.id
                prof_res = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
                if prof_res.data and prof_res.data.get("full_name"):
                    author = prof_res.data["full_name"]
        except Exception:
            pass

    try:
        res = supabase.table("forum_comments").insert({
            "post_id": post_id,
            "user_id": user_id,
            "author_name": author,
            "content": req.content
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str):
    """
    Increments like counter on a post.
    """
    supabase = get_supabase()
    try:
        post = supabase.table("forum_posts").select("likes_count").eq("id", post_id).single().execute()
        if not post.data:
            raise HTTPException(status_code=404, detail="Post not found")
        new_count = (post.data.get("likes_count") or 0) + 1
        res = supabase.table("forum_posts").update({"likes_count": new_count}).eq("id", post_id).execute()
        return {"likes_count": new_count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
