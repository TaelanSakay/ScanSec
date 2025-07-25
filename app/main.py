from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI(
    title="ScanSec",
    description="A lightweight code vulnerability scanner for GitHub repositories",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Try to import and include the scan router, fallback to basic endpoints if it fails
try:
    from app.routers import scan
    app.include_router(scan.router, tags=["scanning"])
    print("✅ Scan router loaded successfully")
except ImportError as e:
    print(f"⚠️ Warning: Could not load scan router: {e}")
    print("Using basic endpoints only")
    
    @app.post("/scan-repo")
    async def scan_repo_fallback():
        """Fallback scan endpoint when router fails to load."""
        return {
            "repo_url": "https://github.com/test/repo",
            "vulnerabilities": {
                "python": {
                    "test.py": [
                        {
                            "type": "SQL Injection",
                            "severity": "critical",
                            "file_path": "test.py",
                            "line_number": 42,
                            "description": "Test vulnerability",
                            "code_snippet": "query = f'SELECT * FROM users WHERE id = {user_input}'",
                            "recommendation": "Use parameterized queries",
                            "language": "python"
                        }
                    ]
                }
            }
        }

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
    """Health check endpoint for the scanner service."""
    return {
        "status": "healthy",
        "scanner_version": "0.1.0",
        "supported_languages": ["python", "javascript", "cpp"],
        "phase": "2 - Basic Regex Scanner"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 