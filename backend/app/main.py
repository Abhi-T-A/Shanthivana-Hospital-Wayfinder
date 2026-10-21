from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.database import check_database_connection

app = FastAPI(
    title="Shanthivana Smart Wayfinder API",
    description="QR-based campus navigation system for Shanthivana.",
    version="0.1.0",
)

# Configure CORS for Vite development and mobile/campus LAN testing
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.111.92.90:5173",
    "http://10.111.92.90:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register v1 API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["System"])
def root():
    return {
        "service": "Shanthivana Smart Wayfinder",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "Shanthivana Smart Wayfinder API",
    }


@app.get("/health/database", tags=["System"])
def database_health_check():
    try:
        check_database_connection()
        return {
            "status": "connected",
            "database": "Supabase PostgreSQL",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed. Check server logs and configuration.",
        ) from exc