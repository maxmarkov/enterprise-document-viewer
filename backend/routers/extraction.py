import logging
import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from services.document_intelligence import analyze_pdf
from services.openai_extraction import extract_json

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Accept octet-stream as some browsers send that for .pdf
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    logger.info("Received /api/extract request: filename=%s, content_type=%s", file.filename, file.content_type)

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    logger.info("File read: %d bytes", len(pdf_bytes))

    stem = Path(file.filename or "document").stem

    # TODO: replace with real Azure calls once credentials are configured
    message = f"Hello from backend! Received file '{file.filename}' ({len(pdf_bytes)} bytes)."
    logger.info("Sending response: %s", message)
    return JSONResponse({"filename": stem, "message": message})
