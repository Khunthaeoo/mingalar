from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header
from typing import Optional, List
from app.services.supabase_client import get_supabase
from app.services.pdf_processor import process_pdf_bytes

router = APIRouter(prefix="/api/documents", tags=["PDF Knowledge Base Management"])

@router.get("")
async def list_documents():
    """
    Lists all uploaded PDF documents and their chunk counts.
    """
    supabase = get_supabase()
    try:
        docs_res = supabase.table("documents").select(
            "id, title, file_name, file_url, file_size, created_at, document_chunks(count)"
        ).order("created_at", desc=True).execute()
        return docs_res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload")
async def upload_pdf_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
):
    """
    Uploads a PDF document, extracts text with PyMuPDF, generates 768-dim vector embeddings,
    and indexes chunks in the pgvector database for RAG search.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    supabase = get_supabase()
    doc_title = title or file.filename.replace(".pdf", "").replace("-", " ").title()

    try:
        content_bytes = await file.read()
        file_size = len(content_bytes)

        # 1. Insert document record
        doc_res = supabase.table("documents").insert({
            "title": doc_title,
            "file_name": file.filename,
            "file_url": f"local://{file.filename}",
            "file_size": file_size
        }).execute()

        if not doc_res.data:
            raise RuntimeError("Failed to create document record.")

        doc_id = doc_res.data[0]["id"]

        # 2. Extract text and generate chunks + embeddings
        chunks = await process_pdf_bytes(content_bytes, file.filename)

        # 3. Store chunks into document_chunks table
        if chunks:
            records = []
            for c in chunks:
                records.append({
                    "document_id": doc_id,
                    "chunk_index": c["chunk_index"],
                    "content": c["content"],
                    "embedding": c["embedding"],
                    "metadata": c["metadata"]
                })

            # Batch insert chunks
            supabase.table("document_chunks").insert(records).execute()

        return {
            "message": f"Document '{doc_title}' processed and indexed successfully.",
            "document_id": doc_id,
            "chunks_created": len(chunks)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Processing failed: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Deletes a document and cascades deletion of its vector chunks.
    """
    supabase = get_supabase()
    try:
        supabase.table("documents").delete().eq("id", document_id).execute()
        return {"message": "Document and associated vector chunks deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
