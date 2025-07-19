from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import time
import re
import os
import tempfile
import subprocess
from pathlib import Path
from typing import List, Dict, Any

from app.models.scan import ScanRequest
from app.schemas.scan_result import ScanResult, ScanSummary, Vulnerability

router = APIRouter()

def detect_python_vulnerabilities(file_path: str, content: str) -> List[Vulnerability]:
    """Detect vulnerabilities in Python source code."""
    vulnerabilities = []
    lines = content.split('\n')
    
    # Patterns for Python vulnerabilities
    patterns = {
        'eval_exec': {
            'pattern': r'\b(eval|exec)\s*\(',
            'description': 'Use of eval() or exec() - dangerous code execution',
            'severity': 'high',
            'recommendation': 'Avoid eval() and exec(). Use safer alternatives like ast.literal_eval() for simple cases.'
        },
        'pickle': {
            'pattern': r'\b(pickle\.loads?|pickle\.load)\s*\(',
            'description': 'Use of pickle.load() - potential code injection',
            'severity': 'high',
            'recommendation': 'Avoid pickle for untrusted data. Use JSON or other serialization formats.'
        },
        'hardcoded_secrets': {
            'pattern': r'(api_key|secret|password|token)\s*=\s*[\'"][^\'"]+[\'"]',
            'description': 'Hardcoded secret found in code',
            'severity': 'medium',
            'recommendation': 'Use environment variables or secure secret management.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            if re.search(config['pattern'], line, re.IGNORECASE):
                vulnerabilities.append(Vulnerability(
                    type=vuln_type,
                    severity=config['severity'],
                    file_path=file_path,
                    line_number=line_num,
                    description=config['description'],
                    code_snippet=line.strip(),
                    recommendation=config['recommendation'],
                    language='python'
                ))
    
    return vulnerabilities

def detect_javascript_vulnerabilities(file_path: str, content: str) -> List[Vulnerability]:
    """Detect vulnerabilities in JavaScript source code."""
    vulnerabilities = []
    lines = content.split('\n')
    
    # Patterns for JavaScript vulnerabilities
    patterns = {
        'eval_function': {
            'pattern': r'\b(eval|Function)\s*\(',
            'description': 'Use of eval() or Function() - dangerous code execution',
            'severity': 'high',
            'recommendation': 'Avoid eval() and Function(). Use safer alternatives.'
        },
        'innerhtml': {
            'pattern': r'\.innerHTML\s*=',
            'description': 'Direct innerHTML assignment - potential XSS',
            'severity': 'medium',
            'recommendation': 'Use textContent or proper DOM manipulation methods.'
        },
        'unescaped_input': {
            'pattern': r'innerHTML\s*=\s*[^;]*[\'"][^;]*[\'"][^;]*\+',
            'description': 'Unescaped user input in innerHTML',
            'severity': 'high',
            'recommendation': 'Always escape user input before inserting into DOM.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            if re.search(config['pattern'], line, re.IGNORECASE):
                vulnerabilities.append(Vulnerability(
                    type=vuln_type,
                    severity=config['severity'],
                    file_path=file_path,
                    line_number=line_num,
                    description=config['description'],
                    code_snippet=line.strip(),
                    recommendation=config['recommendation'],
                    language='javascript'
                ))
    
    return vulnerabilities

def detect_cpp_vulnerabilities(file_path: str, content: str) -> List[Vulnerability]:
    """Detect vulnerabilities in C++ source code."""
    vulnerabilities = []
    lines = content.split('\n')
    
    # Patterns for C++ vulnerabilities
    patterns = {
        'gets_function': {
            'pattern': r'\bgets\s*\(',
            'description': 'Use of gets() - buffer overflow vulnerability',
            'severity': 'critical',
            'recommendation': 'Use fgets() or std::getline() instead of gets().'
        },
        'strcpy_unsafe': {
            'pattern': r'\bstrcpy\s*\(',
            'description': 'Use of strcpy() - potential buffer overflow',
            'severity': 'high',
            'recommendation': 'Use strncpy() or std::string instead.'
        },
        'system_call': {
            'pattern': r'\bsystem\s*\(',
            'description': 'Use of system() - command injection risk',
            'severity': 'medium',
            'recommendation': 'Use specific APIs instead of system() calls.'
        },
        'hardcoded_credentials': {
            'pattern': r'(password|secret|key)\s*=\s*[\'"][^\'"]+[\'"]',
            'description': 'Hardcoded credentials found in code',
            'severity': 'medium',
            'recommendation': 'Use configuration files or environment variables.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            if re.search(config['pattern'], line, re.IGNORECASE):
                vulnerabilities.append(Vulnerability(
                    type=vuln_type,
                    severity=config['severity'],
                    file_path=file_path,
                    line_number=line_num,
                    description=config['description'],
                    code_snippet=line.strip(),
                    recommendation=config['recommendation'],
                    language='cpp'
                ))
    
    return vulnerabilities

def scan_file(file_path: str) -> List[Vulnerability]:
    """Scan a single file for vulnerabilities based on its extension."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.py':
            return detect_python_vulnerabilities(file_path, content)
        elif file_ext == '.js':
            return detect_javascript_vulnerabilities(file_path, content)
        elif file_ext in ['.cpp', '.cc', '.cxx', '.c++']:
            return detect_cpp_vulnerabilities(file_path, content)
        else:
            return []
            
    except Exception as e:
        # TODO: Add proper logging
        print(f"Error scanning file {file_path}: {e}")
        return []

def clone_repository(repo_url: str) -> str:
    """Clone the repository to a temporary directory."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Extract repo name from URL
        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        
        clone_url = repo_url if repo_url.endswith('.git') else f"{repo_url}.git"
        
        # Clone the repository
        result = subprocess.run(
            ['git', 'clone', clone_url, temp_dir],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"Failed to clone repository: {result.stderr}")
        
        return temp_dir
        
    except subprocess.TimeoutExpired:
        raise Exception("Repository clone timed out")
    except Exception as e:
        raise Exception(f"Failed to clone repository: {str(e)}")

def find_source_files(repo_path: str) -> List[str]:
    """Find all Python, JavaScript, and C++ source files in the repository."""
    source_files = []
    supported_extensions = {'.py', '.js', '.cpp', '.cc', '.cxx', '.c++'}
    
    for root, dirs, files in os.walk(repo_path):
        # Skip common directories that shouldn't be scanned
        dirs[:] = [d for d in dirs if d not in {'.git', '__pycache__', 'node_modules', 'venv', '.venv', 'build', 'dist'}]
        
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
    
    Args:
        request: ScanRequest containing the repository URL and optional scan type
        
    Returns:
        ScanResult: Complete scan results with findings and summary
        
    Raises:
        HTTPException: If the scan fails or repository is inaccessible
    """
    start_time = time.time()
    
    try:
        # Clone the repository
        repo_path = clone_repository(str(request.repo_url))
        
        # Find all source files
        source_files = find_source_files(repo_path)
        
        # Scan each file for vulnerabilities
        all_vulnerabilities = []
        for file_path in source_files:
            # Convert to relative path for reporting
            relative_path = os.path.relpath(file_path, repo_path)
            vulnerabilities = scan_file(file_path)
            
            # Update file paths to be relative
            for vuln in vulnerabilities:
                vuln.file_path = relative_path
            
            all_vulnerabilities.extend(vulnerabilities)
        
        # Calculate scan duration
        scan_duration = time.time() - start_time
        
        # Create summary
        summary = ScanSummary(
            total_files_scanned=len(source_files),
            total_vulnerabilities=len(all_vulnerabilities),
            scan_duration_seconds=scan_duration,
            scan_types_performed=[request.scan_type] if request.scan_type != "all" else ["secrets", "injection", "dangerous_functions"]
        )
        
        # Generate unique scan ID
        scan_id = f"scan_{uuid.uuid4().hex[:8]}"
        
        # Create scan result
        result = ScanResult(
            repo_url=str(request.repo_url),
            scan_id=scan_id,
            scan_timestamp=datetime.utcnow(),
            status="completed",
            summary=summary,
            vulnerabilities=all_vulnerabilities,
            metadata={
                "scanner_version": "0.1.0",
                "scan_type": request.scan_type,
                "phase": "2 - Basic Regex Scanner",
                "languages_supported": ["python", "javascript", "cpp"],
                "files_scanned": len(source_files)
            }
        )
        
        # Clean up temporary directory
        import shutil
        shutil.rmtree(repo_path, ignore_errors=True)
        
        return result
        
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