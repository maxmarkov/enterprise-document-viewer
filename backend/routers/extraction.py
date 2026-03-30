import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from services.document_intelligence import analyze_pdf
from services.openai_extraction import extract_json

router = APIRouter()


@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Accept octet-stream as some browsers send that for .pdf
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    stem = Path(file.filename or "document").stem

    try:
        markdown = analyze_pdf(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Document Intelligence error: {exc}") from exc

    try:
        extracted = extract_json(markdown)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI extraction error: {exc}") from exc

    return JSONResponse({"filename": stem, "markdown": markdown, "json": extracted})
