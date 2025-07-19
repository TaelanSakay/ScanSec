from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import scan

# Create FastAPI app instance
app = FastAPI(
    title="ScanSec",
    description="A lightweight code vulnerability scanner for GitHub repositories",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for future web UI integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scan.router, prefix="/api/v1", tags=["scanning"])

@app.get("/")
async def root():
    """Root endpoint with basic project information."""
    return {
        "message": "Welcome to ScanSec",
        "description": "A lightweight code vulnerability scanner",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "ScanSec",
        "version": "0.1.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 