from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, scan
from app.database import init_models, async_engine
from sqlalchemy import text
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ScanSec API",
    description="Security vulnerability scanner for GitHub repositories",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Development
    "https://scansec.vercel.app",  # Production frontend
    "https://scansec-frontend.vercel.app",  # Alternative production URL
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(scan.router, prefix="/scan", tags=["scanning"])  # Prefixed routes
app.include_router(scan.scan_repo_router, tags=["scanning"])  # Direct routes without prefix

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        async with async_engine.begin() as conn:
            await init_models()  # Create tables
            result = await conn.run_sync(
                lambda sync_conn: sync_conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            )
            tables = [row[0] for row in result.fetchall()]
            print(f"✅ Database initialized. Tables: {tables}")
    except Exception as e:
        import traceback
        print("❌ Failed to initialize database:", e)
        traceback.print_exc()

@app.get("/")
async def root():
    return {"message": "ScanSec API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "ai_available": bool(os.getenv("CLAUDE_API_KEY")),
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 