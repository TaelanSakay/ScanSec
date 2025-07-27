from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
import uuid
import time
import re
import os
import tempfile
import subprocess
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, HttpUrl
import git
import csv
import json
from io import StringIO
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.scan import ScanRequest
from app.schemas.scan_result import ScanResult, ScanSummary, Vulnerability
from app.schemas.scan_result import ScanMetadata
from app.scanners import scan_file_by_language
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan_history import ScanHistory
from app.database import get_session
from app.services.ai_recommendation import ai_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Create a separate router for scan-repo endpoint without prefix
scan_repo_router = APIRouter()

class ScanRepoRequest(BaseModel):
    repo_url: HttpUrl

def validate_github_url(repo_url: str) -> bool:
    """Validate GitHub repository URL format."""
    if not repo_url.startswith("https://github.com/"):
        return False
    
    # Check for valid GitHub repo pattern
    pattern = r"^https://github\.com/[\w\-\.]+/[\w\-\.]+/?(\.git)?$"
    return bool(re.match(pattern, repo_url))

def determine_language(file_path: str) -> Optional[str]:
    """Determine the programming language based on file extension."""
    file_ext = Path(file_path).suffix.lower()
    
    language_map = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.c++': 'cpp',
        '.c': 'c',
        '.h': 'cpp',
        '.hpp': 'cpp'
    }
    
    return language_map.get(file_ext)

def scan_file(file_path: str, language_override: Optional[str] = None) -> List[Vulnerability]:
    """Scan a single file for vulnerabilities."""
    try:
        language = language_override or determine_language(file_path)
        if not language:
            return []
        
        # Check if file exists and is readable
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {file_path}")
            return []
        
        # Check file size (skip files larger than 1MB for performance)
        file_size = os.path.getsize(file_path)
        if file_size > 1024 * 1024:  # 1MB limit
            logger.warning(f"File too large, skipping: {file_path} ({file_size} bytes)")
            return []
        
        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Failed to read file {file_path}: {e}")
            return []
        
        # Use the scanner module with all required arguments
        vulnerabilities = scan_file_by_language(file_path, content, language)
        
        # Convert dict results to Vulnerability objects if needed
        if vulnerabilities and isinstance(vulnerabilities[0], dict):
            return [Vulnerability(**vuln) for vuln in vulnerabilities]
        
        return vulnerabilities
    except Exception as e:
        logger.error(f"Error scanning file {file_path}: {e}")
        return []

async def clone_repository(repo_url: str) -> str:
    """Clone repository to temporary directory with error handling."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        logger.info(f"Cloning repository: {repo_url}")
        git.Repo.clone_from(repo_url, temp_dir, depth=1)
        logger.info(f"Successfully cloned repository to: {temp_dir}")
        return temp_dir
    except git.exc.GitCommandError as e:
        logger.error(f"Git clone failed for {repo_url}: {e}")
        if "Repository not found" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found. Please check the URL and ensure the repository is public."
            )
        elif "Authentication failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Repository is private or requires authentication."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to clone repository: {str(e)}"
            )
    except Exception as e:
        logger.error(f"Unexpected error cloning repository {repo_url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clone repository: {str(e)}"
        )

def find_source_files(repo_path: str) -> List[str]:
    """Find all source code files in the repository."""
    allowed_exts = {'.py', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'}
    code_files = []
    
    try:
        for root, dirs, files in os.walk(repo_path):
            # Skip common directories that shouldn't be scanned
            dirs[:] = [d for d in dirs if d not in {
                '.git', 'node_modules', '__pycache__', 'venv', '.venv', 
                'build', 'dist', '.pytest_cache', '.mypy_cache'
            }]
            
            for file in files:
                ext = Path(file).suffix.lower()
                if ext in allowed_exts:
                    code_files.append(os.path.join(root, file))
        
        logger.info(f"Found {len(code_files)} source files to scan")
        return code_files
    except Exception as e:
        logger.error(f"Error finding source files: {e}")
        return []

# Function to perform scan (shared between both routers)
async def perform_scan_logic(
    scan_request: ScanRequest,
    current_user: User,
    db: AsyncSession
) -> ScanResult:
    """Shared scan logic between different endpoints."""
    start_time = time.time()
    repo_url = str(scan_request.repo_url)
    
    logger.info(f"Starting scan for repository: {repo_url} by user: {current_user.email}")
    
    # Validate repository URL
    if not validate_github_url(repo_url):
        logger.warning(f"Invalid GitHub URL provided: {repo_url}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub repository URL. Please provide a valid public GitHub repository URL."
        )
    
    temp_dir = None
    try:
        # Clone repository
        temp_dir = await clone_repository(repo_url)
        
        # Find source files
        code_files = find_source_files(temp_dir)
        if not code_files:
            logger.warning(f"No source files found in repository: {repo_url}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No supported source files found in the repository."
            )
        
        # Scan files
        all_vulnerabilities = []
        results_by_language = {}
        language_breakdown = {}
        
        for file_path in code_files:
            language = determine_language(file_path)
            if not language:
                continue
                
            rel_path = os.path.relpath(file_path, temp_dir)
            vulnerabilities = scan_file(file_path, language_override=language)
            
            if vulnerabilities:
                if language not in results_by_language:
                    results_by_language[language] = {}
                results_by_language[language][rel_path] = [v.dict() for v in vulnerabilities]
                all_vulnerabilities.extend(vulnerabilities)
                
                # Count vulnerabilities by language
                language_breakdown[language] = language_breakdown.get(language, 0) + len(vulnerabilities)
        
        # Calculate scan duration
        scan_duration = time.time() - start_time
        
        # Count vulnerabilities by severity
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for vuln in all_vulnerabilities:
            severity = vuln.severity.lower() if hasattr(vuln, 'severity') else "low"
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        # Create scan summary with proper fields
        scan_summary = ScanSummary(
            total_files_scanned=len(code_files),
            total_vulnerabilities=len(all_vulnerabilities),
            scan_duration_seconds=scan_duration,
            scan_types_performed=["static-analysis"],
            language_breakdown=language_breakdown
        )
        
        # Create scan result
        scan_result = ScanResult(
            scan_id=str(uuid.uuid4()),
            repo_url=repo_url,
            scan_timestamp=datetime.utcnow(),
            status="completed",
            summary=scan_summary,
            vulnerabilities=all_vulnerabilities,
            metadata={
                "scanner_version": "1.0.0",
                "scan_type": scan_request.scan_type,
                "phase": "2 - Basic Regex Scanner",
                "languages_supported": ["python", "javascript", "cpp"],
                "files_scanned": len(code_files),
                "supported_extensions": [".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".cc", ".cxx", ".c++", ".c", ".h", ".hpp"]
            },
            scan_metadata=ScanMetadata(
                start_time=datetime.utcfromtimestamp(start_time).isoformat() + 'Z',
                end_time=datetime.utcnow().isoformat() + 'Z',
                duration_seconds=scan_duration
            )
        )
        
        # Save scan to history
        scan_history = ScanHistory(
            user_id=current_user.id,
            repo_url=repo_url,
            scan_duration=int(scan_duration),
            total_vulnerabilities=len(all_vulnerabilities),
            critical_count=severity_counts["critical"],
            high_count=severity_counts["high"],
            medium_count=severity_counts["medium"],
            low_count=severity_counts["low"],
            scan_summary=scan_summary.dict(),
            vulnerabilities=[v.dict() for v in all_vulnerabilities],
            status="completed"
        )
        
        db.add(scan_history)
        await db.commit()
        await db.refresh(scan_history)
        
        logger.info(f"Scan completed successfully for {repo_url}. Found {len(all_vulnerabilities)} vulnerabilities.")
        
        return scan_result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during scan of {repo_url}: {e}")
        
        # Save failed scan to history
        if 'scan_duration' not in locals():
            scan_duration = time.time() - start_time
        
        scan_history = ScanHistory(
            user_id=current_user.id,
            repo_url=repo_url,
            scan_duration=int(scan_duration),
            status="failed"
        )
        
        try:
            db.add(scan_history)
            await db.commit()
        except Exception as db_error:
            logger.error(f"Failed to save scan history: {db_error}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )
    finally:
        # Clean up temporary directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                import shutil
                shutil.rmtree(temp_dir, ignore_errors=True)
                logger.info(f"Cleaned up temporary directory: {temp_dir}")
            except Exception as e:
                logger.error(f"Failed to clean up temporary directory {temp_dir}: {e}")

# Route for /scan-repo (direct access for frontend)
@scan_repo_router.post("/scan-repo", response_model=ScanResult)
async def scan_repo_direct(
    scan_request: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Scan a GitHub repository for vulnerabilities (direct endpoint for frontend)."""
    return await perform_scan_logic(scan_request, current_user, db)

# Route for /scan/scan-repo (prefixed endpoint)
@router.post("/scan-repo", response_model=ScanResult)
async def scan_repository(
    scan_request: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Scan a GitHub repository for vulnerabilities."""
    return await perform_scan_logic(scan_request, current_user, db)

@router.get("/history", response_model=List[dict])
async def get_scan_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
    limit: int = 20,
    offset: int = 0
):
    """Get user's scan history."""
    try:
        logger.info(f"Fetching scan history for user: {current_user.email}")
        
        # Query scan history for the current user
        result = await db.execute(
            select(ScanHistory)
            .where(ScanHistory.user_id == current_user.id)
            .order_by(ScanHistory.scan_timestamp.desc())
            .limit(limit)
            .offset(offset)
        )
        
        scan_history = result.scalars().all()
        logger.info(f"Found {len(scan_history)} scan history records")
        
        return [scan.to_dict() for scan in scan_history]
        
    except Exception as e:
        logger.error(f"Error fetching scan history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch scan history: {str(e)}"
        )

@router.get("/history/{scan_id}", response_model=dict)
async def get_scan_details(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Get detailed information about a specific scan."""
    try:
        logger.info(f"Fetching scan details for scan_id: {scan_id}")
        
        result = await db.execute(
            select(ScanHistory)
            .where(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
        )
        
        scan = result.scalar_one_or_none()
        
        if not scan:
            logger.warning(f"Scan not found: {scan_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        return scan.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching scan details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch scan details: {str(e)}"
        )

@router.post("/recommendation")
async def get_ai_recommendation(
    vulnerability_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered recommendations for vulnerabilities."""
    try:
        logger.info(f"Requesting AI recommendation for user: {current_user.email}")
        
        if not ai_service.is_available():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI recommendation service is not available"
            )
        
        recommendation = await ai_service.get_recommendation(vulnerability_data)
        return {"recommendation": recommendation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI recommendation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI recommendation: {str(e)}"
        )

@router.get("/ai-status")
async def get_ai_status():
    """Check if AI recommendation service is available."""
    return {
        "available": ai_service.is_available(),
        "service": "claude"
    }

@router.get("/health")
async def health_check():
    """Health check for scan service."""
    return {
        "status": "healthy",
        "service": "scan",
        "timestamp": datetime.utcnow().isoformat()
    } 