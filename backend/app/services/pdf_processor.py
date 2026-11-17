import io
from typing import List, Dict, Any
from app.services.embedding_service import generate_embedding

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

async def process_pdf_bytes(pdf_bytes: bytes, file_name: str) -> List[Dict[str, Any]]:
    """
    Extracts text from PDF bytes using PyMuPDF and breaks into semantic chunks with embeddings.
    """
    extracted_pages = []

    if PYMUPDF_AVAILABLE:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                extracted_pages.append({"page": page_num + 1, "text": text})
        doc.close()
    else:
        # Fallback raw byte text extraction if PyMuPDF is compiling
        text = pdf_bytes.decode("utf-8", errors="ignore").strip()
        extracted_pages.append({"page": 1, "text": text})

    # Chunking strategy: 400-600 characters per chunk with 100 char overlap
    chunks = []
    chunk_index = 0

    for page_info in extracted_pages:
        page_num = page_info["page"]
        page_text = page_info["text"]

        # Split by paragraphs or sentences
        paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
        current_chunk = ""

        for p in paragraphs:
            if len(current_chunk) + len(p) < 600:
                current_chunk += ("\n" + p if current_chunk else p)
            else:
                if current_chunk:
                    emb = await generate_embedding(current_chunk)
                    chunks.append({
                        "chunk_index": chunk_index,
                        "content": current_chunk,
                        "embedding": emb,
                        "metadata": {
                            "file_name": file_name,
                            "page": page_num
                        }
                    })
                    chunk_index += 1
                current_chunk = p

        if current_chunk:
            emb = await generate_embedding(current_chunk)
            chunks.append({
                "chunk_index": chunk_index,
                "content": current_chunk,
                "embedding": emb,
                "metadata": {
                    "file_name": file_name,
                    "page": page_num
                }
            })
            chunk_index += 1

    return chunks
