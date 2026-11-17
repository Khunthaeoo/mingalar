from fastapi import APIRouter, HTTPException, Query, Header, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/articles", tags=["Information Center Articles"])

class ArticleCreateRequest(BaseModel):
    category_id: int
    title: str
    slug: str
    summary: Optional[str] = ""
    content: str
    language: Optional[str] = "en"
    is_published: Optional[bool] = True

class ArticleUpdateRequest(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    is_published: Optional[bool] = None

@router.get("")
async def list_articles(
    category_slug: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
):
    """
    List articles with category filtering, language filtering, and search keyword.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("articles").select(
            "id, category_id, title, slug, summary, language, last_reviewed, is_published, created_at, categories(id, name, name_zh, name_my, slug, icon)"
        ).eq("is_published", True)

        if language:
            query = query.eq("language", language)

        if q:
            query = query.or_(f"title.ilike.%{q}%,summary.ilike.%{q}%,content.ilike.%{q}%")

        res = query.order("created_at", desc=True).execute()
        articles = res.data or []

        # Filter by category slug if provided
        if category_slug:
            articles = [
                a for a in articles 
                if a.get("categories") and a["categories"].get("slug") == category_slug
            ]

        return articles
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories/all")
async def get_all_categories():
    """
    Fetches all information categories.
    """
    supabase = get_supabase()
    try:
        res = supabase.table("categories").select("*").order("sort_order").execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{slug_or_id}")
async def get_article_detail(slug_or_id: str):
    """
    Fetches single article by ID or slug.
    """
    supabase = get_supabase()
    try:
        # Try slug first
        res = supabase.table("articles").select(
            "*, categories(id, name, name_zh, name_my, slug, icon)"
        ).eq("slug", slug_or_id).execute()

        if not res.data:
            # Try UUID
            res = supabase.table("articles").select(
                "*, categories(id, name, name_zh, name_my, slug, icon)"
            ).eq("id", slug_or_id).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="Article not found")

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("")
async def create_article(req: ArticleCreateRequest, authorization: str = Header(...)):
    """
    Creates a new article (Admin only).
    """
    supabase = get_supabase()
    try:
        res = supabase.table("articles").insert({
            "category_id": req.category_id,
            "title": req.title,
            "slug": req.slug,
            "summary": req.summary,
            "content": req.content,
            "language": req.language,
            "is_published": req.is_published
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{article_id}")
async def delete_article(article_id: str, authorization: str = Header(...)):
    """
    Deletes an article by ID (Admin only).
    """
    supabase = get_supabase()
    try:
        supabase.table("articles").delete().eq("id", article_id).execute()
        return {"message": "Article deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
