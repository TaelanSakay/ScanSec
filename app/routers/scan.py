from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
import uuid
import time
import re
import os
import tempfile
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, HttpUrl
import git

from app.models.scan import ScanRequest
from app.schemas.scan_result import ScanResult, ScanSummary, Vulnerability
from app.schemas.scan_result import ScanMetadata
from app.scanners import scan_file_by_language

router = APIRouter()

# TODO: Phase 2 - Replace basic regex with AST analysis for more accurate detection
# TODO: Phase 3 - Add support for external security tools (Bandit, Semgrep, etc.)
# TODO: Phase 4 - Implement custom rule engine for user-defined patterns

class ScanRepoRequest(BaseModel):
    repo_url: HttpUrl

@router.post("/scan-repo")
async def scan_repo(request: ScanRepoRequest):
    """
    Scan a public GitHub repository for vulnerabilities in Python, JavaScript, and C++ files.
    Returns a structured JSON report of all detected vulnerabilities by language and file.
    """
    # Sanitize and validate input
    repo_url = str(request.repo_url)
    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Only public GitHub repositories are supported.")
    # Only allow valid repo URLs
    import re
    if not re.match(r"^https://github.com/[\w\-\.]+/[\w\-\.]+/?(\.git)?$", repo_url):
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL format.")
    # Clone repo to temp dir
    temp_dir = tempfile.mkdtemp()
    try:
        git.Repo.clone_from(repo_url, temp_dir, depth=1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clone repository: {e}")
    # Recursively find code files
    allowed_exts = {'.py', '.js', '.cpp', '.h'}
    code_files = []
    for root, dirs, files in os.walk(temp_dir):
        # Skip .git and node_modules, etc.
        dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '__pycache__', 'venv', '.venv'}]
        for file in files:
            ext = Path(file).suffix.lower()
            if ext in allowed_exts:
                code_files.append(os.path.join(root, file))
    # Scan files
    results = {}
    for file_path in code_files:
        language = determine_language(file_path)
        if not language:
            continue
        rel_path = os.path.relpath(file_path, temp_dir)
        vulns = scan_file(file_path, language_override=language)
        if not vulns:
            continue
        if language not in results:
            results[language] = {}
        results[language][rel_path] = [v.dict() for v in vulns]
    # Clean up
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)
    return {"repo_url": repo_url, "vulnerabilities": results}

def determine_language(file_path: str) -> Optional[str]:
    """
    Determine the programming language based on file extension.
    
    TODO: Add more sophisticated language detection (e.g., shebang analysis)
    TODO: Support for additional file extensions
    """
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
    """
    Scan a single file for vulnerabilities based on its extension or a language override.
    
    TODO: Add file size limits and binary file detection
    TODO: Implement parallel processing for large files
    TODO: Add support for more file types
    """
    try:
        # Check if file exists and is readable
        if not os.path.exists(file_path):
            return []
        
        # Check file size (skip files larger than 1MB for performance)
        file_size = os.path.getsize(file_path)
        if file_size > 1024 * 1024:  # 1MB limit
            # TODO: Implement chunked reading for large files
            return []
        
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Determine language and route to appropriate scanner
        language = language_override or determine_language(file_path)
        
        if language:
            # Use the new modular scanner
            vulns = scan_file_by_language(file_path, content, language)
            # Convert dicts to Vulnerability objects
            return [Vulnerability(**v) for v in vulns]
        else:
            return []
            
    except Exception as e:
        # TODO: Add proper logging instead of print
        print(f"Error scanning file {file_path}: {e}")
        return []

def clone_repository(repo_url: str) -> str:
    """
    Clone the repository to a temporary directory.
    
    Handles errors for invalid URLs, repo not found, network issues, timeouts, and missing git.
    
    TODO: Add retry logic or GitHub API support for more robust cloning
    """
    import re
    from fastapi import HTTPException
    temp_dir = tempfile.mkdtemp()

    # Basic GitHub URL validation
    github_url_pattern = re.compile(r"^https://github.com/[^/]+/[^/]+/?(\.git)?$")
    if not github_url_pattern.match(repo_url):
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL format. Expected: https://github.com/user/repo")

    try:
        # Extract repo name from URL
        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        clone_url = repo_url if repo_url.endswith('.git') else f"{repo_url}.git"

        # Try to clone with a short timeout for responsiveness
        result = subprocess.run(
            ['git', 'clone', clone_url, temp_dir],
            capture_output=True,
            text=True,
            timeout=15,  # Short timeout for initial connection
            check=False
        )
        if result.returncode != 0:
            stderr = result.stderr.lower()
            if 'not found' in stderr or 'repository' in stderr and 'not found' in stderr:
                raise HTTPException(status_code=404, detail="Repository not found or inaccessible (404). Please check the URL.")
            if 'could not resolve host' in stderr or 'network' in stderr or 'connection' in stderr:
                raise HTTPException(status_code=500, detail="Network error while cloning repository. Please check your connection.")
            if 'fatal: not a git repository' in stderr or 'fatal: unable to access' in stderr:
                raise HTTPException(status_code=400, detail="Invalid or inaccessible repository URL.")
            if 'git: not found' in stderr or 'not recognized as an internal or external command' in stderr:
                raise HTTPException(status_code=500, detail="Git is not installed on the server.")
            # Fallback for other errors
            raise HTTPException(status_code=500, detail=f"Failed to clone repository: {result.stderr.strip()}")
        return temp_dir
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Repository clone timed out. Please try again later.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during repository clone: {str(e)}")

def find_source_files(repo_path: str) -> List[str]:
    """
    Recursively find all source files with supported extensions.
    
    TODO: Add configuration for custom file patterns
    TODO: Implement parallel file discovery
    TODO: Add support for .gitignore patterns
    """
    source_files = []
    supported_extensions = {'.py', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.cc', '.cxx', '.c++', '.c', '.h', '.hpp'}
    
    # Directories to skip during scanning
    skip_dirs = {'.git', '__pycache__', 'node_modules', 'venv', '.venv', 'build', 'dist', '.pytest_cache', '.mypy_cache'}
    
    for root, dirs, files in os.walk(repo_path):
        # Skip unwanted directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in supported_extensions:
                source_files.append(str(file_path))
    
    return source_files

@router.post("/scan", response_model=ScanResult)
async def scan_repository(request: ScanRequest):
    """
    Scan a GitHub repository for security vulnerabilities.
    
    This endpoint accepts a repository URL and performs various security scans
    including hardcoded secrets, dangerous functions, SQL injection patterns,
    and more.
    
    TODO: Add scan progress tracking
    TODO: Implement scan result caching
    TODO: Add support for incremental scans
    TODO: Implement scan result storage in database
    
    Args:
        request: ScanRequest containing the repository URL and optional scan type
        
    Returns:
        ScanResult: Complete scan results with findings and summary
        
    Raises:
        HTTPException: If the scan fails or repository is inaccessible
    """
    # Record scan start time (UTC, ISO 8601)
    scan_start_dt = datetime.utcnow()
    scan_start_iso = scan_start_dt.isoformat(timespec="seconds") + 'Z'
    start_time = time.time()
    
    try:
        # Clone the repository
        repo_path = clone_repository(str(request.repo_url))
        
        # Find all source files
        source_files = find_source_files(repo_path)
        
        if not source_files:
            raise HTTPException(
                status_code=400,
                detail="No supported source files found in repository"
            )
        
        # If language is specified in request, filter files
        language_filter = getattr(request, 'language', None)
        all_vulnerabilities = []
        files_scanned = 0
        language_breakdown = {}
        for file_path in source_files:
            detected_language = determine_language(file_path)
            if language_filter and detected_language != language_filter:
                continue
            relative_path = os.path.relpath(file_path, repo_path)
            vulnerabilities = scan_file(file_path, language_override=language_filter)
            for vuln in vulnerabilities:
                vuln.file_path = relative_path
                if vuln.language:
                    language_breakdown[vuln.language] = language_breakdown.get(vuln.language, 0) + 1
            all_vulnerabilities.extend(vulnerabilities)
            files_scanned += 1
        
        # Calculate scan duration
        scan_end_dt = datetime.utcnow()
        scan_end_iso = scan_end_dt.isoformat(timespec="seconds") + 'Z'
        scan_duration = time.time() - start_time
        
        # Create summary
        summary = ScanSummary(
            total_files_scanned=files_scanned,
            total_vulnerabilities=len(all_vulnerabilities),
            scan_duration_seconds=scan_duration,
            scan_types_performed=[request.scan_type] if request.scan_type != "all" else ["secrets", "injection", "dangerous_functions"],
            language_breakdown=language_breakdown
        )
        
        # Generate unique scan ID
        scan_id = f"scan_{uuid.uuid4().hex[:8]}"
        
        # Create scan result
        result = ScanResult(
            repo_url=str(request.repo_url),
            scan_id=scan_id,
            scan_timestamp=scan_end_dt,
            status="completed",
            summary=summary,
            vulnerabilities=all_vulnerabilities,
            metadata={
                "scanner_version": "0.1.0",
                "scan_type": request.scan_type,
                "phase": "2 - Basic Regex Scanner",
                "languages_supported": ["python", "javascript", "cpp"],
                "files_scanned": files_scanned,
                "supported_extensions": [".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".cc", ".cxx", ".c++", ".c", ".h", ".hpp"]
            },
            scan_metadata=ScanMetadata(
                start_time=scan_start_iso,
                end_time=scan_end_iso,
                duration_seconds=round(scan_duration, 2)
            )
        )
        # TODO: Store scan history or cache scan_metadata for future retrieval (Phase 4)
        
        # Clean up temporary directory
        import shutil
        shutil.rmtree(repo_path, ignore_errors=True)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        # TODO: Add proper error handling and logging
        raise HTTPException(
            status_code=500,
            detail=f"Scan failed: {str(e)}"
        )

@router.get("/scan/{scan_id}", response_model=ScanResult)
async def get_scan_result(scan_id: str):
    """
    Retrieve the results of a previous scan by scan ID.
    
    TODO: Implement scan result storage in database
    TODO: Add scan result caching with TTL
    TODO: Implement scan result sharing and export
    
    Args:
        scan_id: Unique identifier for the scan
        
    Returns:
        ScanResult: The scan results
        
    Raises:
        HTTPException: If scan ID is not found
    """
    # TODO: Implement scan result storage and retrieval
    # For now, return a placeholder response
    raise HTTPException(
        status_code=404,
        detail="Scan result storage not implemented yet"
    )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the scanner service.
    
    TODO: Add dependency checks (git, file system, etc.)
    TODO: Add performance metrics
    """
    return {
        "status": "healthy",
        "scanner_version": "0.1.0",
        "supported_languages": ["python", "javascript", "cpp"],
        "phase": "2 - Basic Regex Scanner"
    } 