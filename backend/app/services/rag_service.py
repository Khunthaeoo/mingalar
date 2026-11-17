import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.supabase_client import get_supabase
from app.services.embedding_service import generate_embedding

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"  # High quality, multilingual capable model on Groq

SYSTEM_PROMPT = """You are MingalarMate AI, an empathetic, highly dependable student assistant designed to support Myanmar students and international scholars studying and living in Taiwan (with initial focus on National Chi Nan University - NCNU).

GUIDELINES:
1. Multilingual Support: You must reply naturally in the same language as the student's question (Burmese / မြန်မာဘာသာ, English, or Traditional Chinese / 繁體中文).
2. Grounded in Facts & Citing Sources: Use the provided [CONTEXT] below to answer. Always reference the sources transparently at the end of your response, e.g., "Source: [Document / Category Title]".
3. Hallucination Guardrail: If the provided [CONTEXT] does not contain verified information to answer the question, DO NOT invent facts, laws, fees, or deadlines. State clearly that you currently lack verified records on that specific detail and recommend checking with the university Office of International Affairs (OIA) or official Taiwan government agencies (such as NIA, MOL, or MOE).
4. Tone: Warm, welcoming, respectful, and supportive (the spirit of 'Mingalarba' and companion 'Mate').
"""

async def query_rag_assistant(
    user_query: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    preferred_language: str = "en"
) -> Dict[str, Any]:
    """
    Executes the RAG pipeline:
    1. Embeds user query.
    2. Searches Supabase document_chunks and articles.
    3. Prompts Groq LLM with retrieved context.
    4. Returns answer and source citations.
    """
    if chat_history is None:
        chat_history = []

    # 1. Retrieve relevant knowledge chunks
    retrieved_sources = []
    context_text = ""

    try:
        query_emb = await generate_embedding(user_query)
        supabase = get_supabase()

        # Call RPC match_document_chunks if available
        try:
            rpc_res = supabase.rpc("match_document_chunks", {
                "query_embedding": query_emb,
                "match_threshold": 0.35,
                "match_count": 4
            }).execute()

            if rpc_res.data:
                for chunk in rpc_res.data:
                    c_text = chunk.get("content", "")
                    meta = chunk.get("metadata", {})
                    source_label = meta.get("file_name", "Student Handbook")
                    page_label = meta.get("page", 1)
                    context_text += f"\n--- [Source: {source_label}, Page {page_label}] ---\n{c_text}\n"
                    retrieved_sources.append({
                        "title": source_label,
                        "page": page_label,
                        "snippet": c_text[:120] + "..."
                    })
        except Exception as e:
            print(f"[RAG] RPC match_document_chunks skipped: {e}")

        # Also search published articles table for keyword relevance
        try:
            keywords = [w for w in user_query.split() if len(w) > 3][:3]
            if keywords:
                search_term = keywords[0]
                art_res = supabase.table("articles").select("title, content, summary").or_(
                    f"title.ilike.%{search_term}%,content.ilike.%{search_term}%"
                ).limit(3).execute()

                if art_res.data:
                    for art in art_res.data:
                        context_text += f"\n--- [Source: Article: {art.get('title')}] ---\n{art.get('summary') or art.get('content')[:300]}\n"
                        retrieved_sources.append({
                            "title": f"Article: {art.get('title')}",
                            "page": "Information Center",
                            "snippet": (art.get('summary') or art.get('content'))[:120] + "..."
                        })
        except Exception as e:
            print(f"[RAG] Articles search error: {e}")

    except Exception as e:
        print(f"[RAG] Vector retrieval error: {e}")

    # Build prompt for Groq
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context_text.strip():
        messages.append({
            "role": "system",
            "content": f"[CONTEXT FOR THIS QUESTION]:\n{context_text}"
        })
    else:
        messages.append({
            "role": "system",
            "content": "[CONTEXT FOR THIS QUESTION]: No specific internal document matches found. Use general verified knowledge about Taiwan student regulations, and advise verifying with official authorities."
        })

    # Append recent chat history (last 4 turns)
    for msg in chat_history[-4:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    # Append current user query
    messages.append({"role": "user", "content": user_query})

    # Call Groq API
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(GROQ_ENDPOINT, headers=headers, json=payload)
        if res.status_code != 200:
            raise RuntimeError(f"Groq API error ({res.status_code}): {res.text}")
        data = res.json()
        ai_reply = data["choices"][0]["message"]["content"]

    return {
        "answer": ai_reply,
        "sources": retrieved_sources,
        "model": GROQ_MODEL
    }
