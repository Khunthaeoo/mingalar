from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, get_cors_origins
from app.routers import auth, profiles, articles, documents, chat, admin, forum, events

app = FastAPI(
    title="MingalarMate API",
    description="Full-stack AI-powered multilingual information platform for international students in Taiwan.",
    version="2.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
origins = get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(articles.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(forum.router)
app.include_router(events.router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "project": "MingalarMate API",
        "status": "online",
        "phases_active": [
            "Phase 2: Authentication & Profiles",
            "Phase 3: Information Center Articles",
            "Phase 4: PDF Vector Knowledge Base (pgvector)",
            "Phase 5: Groq Multilingual RAG AI Assistant",
            "Phase 6: Admin Dashboard & Feedback"
        ],
        "database": "Supabase PostgreSQL + pgvector",
        "llm_engine": "Groq Llama 3.3"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
