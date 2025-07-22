from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import time
import re
import os
import tempfile
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.models.scan import ScanRequest
from app.schemas.scan_result import ScanResult, ScanSummary, Vulnerability
from app.schemas.scan_result import ScanMetadata

router = APIRouter()

# TODO: Phase 2 - Replace basic regex with AST analysis for more accurate detection
# TODO: Phase 3 - Add support for external security tools (Bandit, Semgrep, etc.)
# TODO: Phase 4 - Implement custom rule engine for user-defined patterns

def scan_python_file(file_path: str, content: str) -> List[Vulnerability]:
    """
    Scan Python files for security vulnerabilities using regex patterns.
    
    TODO: Enhance with AST analysis for better accuracy
    TODO: Add more sophisticated pattern matching
    TODO: Integrate with Bandit for additional checks
    TODO: Make patterns configurable via external config file
    """
    vulnerabilities = []
    lines = content.split('\n')
    
    # Comprehensive regex patterns for Python vulnerabilities
    # TODO: Replace with AST-based analysis for better accuracy
    patterns = {
        'eval_exec': {
            'pattern': r'\b(eval|exec)\s*\(',
            'description': 'Use of eval() or exec() - dangerous code execution',
            'severity': 'high',
            'recommendation': 'Avoid eval() and exec(). Use safer alternatives like ast.literal_eval() for simple cases.'
        },
        'pickle_unsafe': {
            'pattern': r'\b(pickle\.loads?|pickle\.load)\s*\(',
            'description': 'Use of pickle.load() - potential code injection',
            'severity': 'high',
            'recommendation': 'Avoid pickle for untrusted data. Use JSON or other serialization formats.'
        },
        'os_system': {
            'pattern': r'\bos\.system\s*\(',
            'description': 'Use of os.system() - command injection risk',
            'severity': 'medium',
            'recommendation': 'Use subprocess.run() with proper argument handling.'
        },
        'subprocess_shell': {
            'pattern': r'\bsubprocess\.(Popen|call|run)\s*\([^)]*shell\s*=\s*True',
            'description': 'Use of subprocess with shell=True - command injection risk',
            'severity': 'high',
            'recommendation': 'Avoid shell=True. Use list arguments instead.'
        },
        'hardcoded_secrets': {
            'pattern': r'(api_key|secret|password|token|key)\s*=\s*[\'"][^\'"]+[\'"]',
            'description': 'Hardcoded secret found in code',
            'severity': 'medium',
            'recommendation': 'Use environment variables or secure secret management.'
        },
        'sql_injection': {
            'pattern': r'(execute|executemany)\s*\(\s*[\'"][^\'"]*\+',
            'description': 'Potential SQL injection - string concatenation in SQL',
            'severity': 'high',
            'recommendation': 'Use parameterized queries or ORM methods.'
        },
        'input_function': {
            'pattern': r'\binput\s*\(',
            'description': 'Use of input() - potential injection risk',
            'severity': 'medium',
            'recommendation': 'Use raw_input() or validate input carefully.'
        },
        'file_operations': {
            'pattern': r'open\s*\([^)]*[\'"][^\'"]*[\'"][^)]*\)',
            'description': 'File operation without proper path validation',
            'severity': 'medium',
            'recommendation': 'Validate file paths and use pathlib for safer operations.'
        },
        'urllib_unsafe': {
            'pattern': r'\burllib\.(urlopen|request)\s*\(',
            'description': 'Use of urllib - potential SSRF risk',
            'severity': 'medium',
            'recommendation': 'Use requests library with proper URL validation.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            matches = re.finditer(config['pattern'], line, re.IGNORECASE)
            for match in matches:
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

def scan_js_file(file_path: str, content: str) -> List[Vulnerability]:
    """
    Scan JavaScript files for security vulnerabilities using regex patterns.
    
    TODO: Enhance with ESLint security rules integration
    TODO: Add more XSS and injection patterns
    TODO: Implement AST-based analysis
    TODO: Make patterns configurable via external config file
    """
    vulnerabilities = []
    lines = content.split('\n')
    
    # Comprehensive regex patterns for JavaScript vulnerabilities
    # TODO: Replace with ESLint security plugin integration
    patterns = {
        'eval_function': {
            'pattern': r'\b(eval|Function)\s*\(',
            'description': 'Use of eval() or Function() - dangerous code execution',
            'severity': 'high',
            'recommendation': 'Avoid eval() and Function(). Use safer alternatives.'
        },
        'innerhtml_xss': {
            'pattern': r'\.innerHTML\s*=',
            'description': 'Direct innerHTML assignment - potential XSS',
            'severity': 'medium',
            'recommendation': 'Use textContent or proper DOM manipulation methods.'
        },
        'document_write': {
            'pattern': r'\bdocument\.write\s*\(',
            'description': 'Use of document.write() - potential XSS',
            'severity': 'medium',
            'recommendation': 'Use DOM manipulation methods instead.'
        },
        'unescaped_input': {
            'pattern': r'innerHTML\s*=\s*[^;]*[\'"][^;]*[\'"][^;]*\+',
            'description': 'Unescaped user input in innerHTML',
            'severity': 'high',
            'recommendation': 'Always escape user input before inserting into DOM.'
        },
        'localstorage_secrets': {
            'pattern': r'localStorage\.setItem\s*\(\s*[\'"][^\'"]*[\'"]\s*,\s*[\'"][^\'"]*[\'"]',
            'description': 'Storing sensitive data in localStorage',
            'severity': 'medium',
            'recommendation': 'Avoid storing sensitive data in localStorage. Use secure alternatives.'
        },
        'sessionstorage_secrets': {
            'pattern': r'sessionStorage\.setItem\s*\(\s*[\'"][^\'"]*[\'"]\s*,\s*[\'"][^\'"]*[\'"]',
            'description': 'Storing sensitive data in sessionStorage',
            'severity': 'medium',
            'recommendation': 'Avoid storing sensitive data in sessionStorage.'
        },
        'settimeout_injection': {
            'pattern': r'setTimeout\s*\(\s*[\'"][^\'"]*[\'"]\s*,',
            'description': 'setTimeout with string - potential code injection',
            'severity': 'medium',
            'recommendation': 'Use function references instead of strings in setTimeout.'
        },
        'setinterval_injection': {
            'pattern': r'setInterval\s*\(\s*[\'"][^\'"]*[\'"]\s*,',
            'description': 'setInterval with string - potential code injection',
            'severity': 'medium',
            'recommendation': 'Use function references instead of strings in setInterval.'
        },
        'location_assign': {
            'pattern': r'location\.(href|assign)\s*=',
            'description': 'Direct location assignment - potential open redirect',
            'severity': 'medium',
            'recommendation': 'Validate URLs before assignment.'
        },
        'console_log_secrets': {
            'pattern': r'console\.(log|warn|error)\s*\(\s*[\'"][^\'"]*(password|secret|token|key)[^\'"]*[\'"]',
            'description': 'Logging sensitive information',
            'severity': 'low',
            'recommendation': 'Avoid logging sensitive data.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            matches = re.finditer(config['pattern'], line, re.IGNORECASE)
            for match in matches:
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

def scan_cpp_file(file_path: str, content: str) -> List[Vulnerability]:
    """
    Scan C++ files for security vulnerabilities using regex patterns.
    
    TODO: Enhance with Clang Static Analyzer integration
    TODO: Add more buffer overflow and memory safety checks
    TODO: Implement custom static analysis rules
    TODO: Make patterns configurable via external config file
    """
    vulnerabilities = []
    lines = content.split('\n')
    
    # Comprehensive regex patterns for C++ vulnerabilities
    # TODO: Replace with Clang Static Analyzer integration
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
        'strcat_unsafe': {
            'pattern': r'\bstrcat\s*\(',
            'description': 'Use of strcat() - potential buffer overflow',
            'severity': 'high',
            'recommendation': 'Use strncat() or std::string instead.'
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
        },
        'malloc_no_check': {
            'pattern': r'\bmalloc\s*\([^)]*\)\s*;',
            'description': 'malloc() without null check',
            'severity': 'medium',
            'recommendation': 'Always check malloc() return value for null.'
        },
        'free_after_use': {
            'pattern': r'\bfree\s*\([^)]*\)\s*;',
            'description': 'Potential use-after-free or double-free',
            'severity': 'medium',
            'recommendation': 'Use smart pointers or RAII for memory management.'
        },
        'scanf_unsafe': {
            'pattern': r'\bscanf\s*\(',
            'description': 'Use of scanf() - potential buffer overflow',
            'severity': 'medium',
            'recommendation': 'Use scanf_s() or std::cin with proper bounds checking.'
        },
        'printf_format_string': {
            'pattern': r'\bprintf\s*\(\s*[^)]*%[^)]*\)',
            'description': 'printf with format string - potential format string attack',
            'severity': 'medium',
            'recommendation': 'Use format string validation or safer alternatives.'
        },
        'memcpy_unsafe': {
            'pattern': r'\bmemcpy\s*\(',
            'description': 'Use of memcpy() - potential buffer overflow',
            'severity': 'medium',
            'recommendation': 'Use memcpy_s() or std::copy with proper bounds checking.'
        },
        'sprintf_unsafe': {
            'pattern': r'\bsprintf\s*\(',
            'description': 'Use of sprintf() - potential buffer overflow',
            'severity': 'medium',
            'recommendation': 'Use snprintf() or std::string instead.'
        }
    }
    
    for line_num, line in enumerate(lines, 1):
        for vuln_type, config in patterns.items():
            matches = re.finditer(config['pattern'], line, re.IGNORECASE)
            for match in matches:
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

def scan_file(file_path: str) -> List[Vulnerability]:
    """
    Scan a single file for vulnerabilities based on its extension.
    
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
        language = determine_language(file_path)
        
        if language == 'python':
            return scan_python_file(file_path, content)
        elif language == 'javascript':
            return scan_js_file(file_path, content)
        elif language == 'cpp':
            return scan_cpp_file(file_path, content)
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
        
        # Scan each file for vulnerabilities
        all_vulnerabilities = []
        files_scanned = 0
        language_breakdown = {}
        
        for file_path in source_files:
            # Convert to relative path for reporting
            relative_path = os.path.relpath(file_path, repo_path)
            vulnerabilities = scan_file(file_path)
            
            # Update file paths to be relative
            for vuln in vulnerabilities:
                vuln.file_path = relative_path
                # Count vulnerabilities per language
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