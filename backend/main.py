from dotenv import load_dotenv
load_dotenv()  # load .env before anything else imports os.environ

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.extraction import router as extraction_router

app = FastAPI(title="Enterprise Document Viewer — Extraction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(extraction_router, prefix="/api")
