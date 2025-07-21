from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Vulnerability(BaseModel):
    """
    Represents a single vulnerability finding.
    
    Attributes:
        type: The type of vulnerability (e.g., 'hardcoded_secret', 'sql_injection', 'eval_exec')
        severity: Severity level ('low', 'medium', 'high', 'critical')
        file_path: Path to the file where the vulnerability was found
        line_number: Line number where the vulnerability was detected
        description: Human-readable description of the vulnerability
        code_snippet: The actual code that triggered the finding
        recommendation: Suggested fix or mitigation
        language: Programming language of the file (e.g., 'python', 'javascript', 'cpp')
    """
    type: str = Field(..., description="Type of vulnerability")
    severity: str = Field(..., description="Severity level")
    file_path: str = Field(..., description="File path where vulnerability was found")
    line_number: int = Field(..., description="Line number of the vulnerability")
    description: str = Field(..., description="Description of the vulnerability")
    code_snippet: str = Field(..., description="Code snippet that triggered the finding")
    recommendation: Optional[str] = Field(None, description="Suggested fix or mitigation")
    language: Optional[str] = Field(None, description="Programming language of the file")
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "eval_exec",
                "severity": "high",
                "file_path": "src/processor.py",
                "line_number": 15,
                "description": "Use of eval() or exec() - dangerous code execution",
                "code_snippet": "result = eval(user_input)",
                "recommendation": "Avoid eval() and exec(). Use safer alternatives like ast.literal_eval() for simple cases.",
                "language": "python"
            }
        }

class ScanSummary(BaseModel):
    """
    Summary statistics for a scan.
    
    Attributes:
        total_files_scanned: Number of files processed
        total_vulnerabilities: Total number of vulnerabilities found
        scan_duration_seconds: Time taken for the scan
        scan_types_performed: List of scan types that were executed
        language_breakdown: Number of vulnerabilities per language
    """
    total_files_scanned: int = Field(..., description="Number of files processed")
    total_vulnerabilities: int = Field(..., description="Total vulnerabilities found")
    scan_duration_seconds: float = Field(..., description="Scan duration in seconds")
    scan_types_performed: List[str] = Field(..., description="Types of scans performed")
    language_breakdown: Dict[str, int] = Field(default_factory=dict, description="Number of vulnerabilities per language")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_files_scanned": 25,
                "total_vulnerabilities": 3,
                "scan_duration_seconds": 12.5,
                "scan_types_performed": ["secrets", "injection", "dangerous_functions"],
                "language_breakdown": {"python": 2, "javascript": 1, "cpp": 1}
            }
        }

class ScanResult(BaseModel):
    """
    Complete scan result response.
    
    Attributes:
        repo_url: The scanned repository URL
        scan_id: Unique identifier for this scan
        scan_timestamp: When the scan was performed
        status: Scan status ('completed', 'failed', 'in_progress')
        summary: Summary statistics
        vulnerabilities: List of found vulnerabilities
        metadata: Additional scan metadata including supported languages and extensions
    """
    repo_url: str = Field(..., description="Scanned repository URL")
    scan_id: str = Field(..., description="Unique scan identifier")
    scan_timestamp: datetime = Field(..., description="When the scan was performed")
    status: str = Field(..., description="Scan status")
    summary: ScanSummary = Field(..., description="Scan summary statistics")
    vulnerabilities: List[Vulnerability] = Field(default_factory=list, description="Found vulnerabilities")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional scan metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "repo_url": "https://github.com/user/repository",
                "scan_id": "scan_123456789",
                "scan_timestamp": "2024-01-15T10:30:00Z",
                "status": "completed",
                "summary": {
                    "total_files_scanned": 25,
                    "total_vulnerabilities": 3,
                    "scan_duration_seconds": 12.5,
                    "scan_types_performed": ["secrets", "injection", "dangerous_functions"]
                },
                "vulnerabilities": [
                    {
                        "type": "eval_exec",
                        "severity": "high",
                        "file_path": "src/processor.py",
                        "line_number": 15,
                        "description": "Use of eval() or exec() - dangerous code execution",
                        "code_snippet": "result = eval(user_input)",
                        "recommendation": "Avoid eval() and exec(). Use safer alternatives like ast.literal_eval() for simple cases.",
                        "language": "python"
                    },
                    {
                        "type": "innerhtml",
                        "severity": "medium",
                        "file_path": "frontend/app.js",
                        "line_number": 42,
                        "description": "Direct innerHTML assignment - potential XSS",
                        "code_snippet": "document.getElementById('content').innerHTML = userData;",
                        "recommendation": "Use textContent or proper DOM manipulation methods.",
                        "language": "javascript"
                    },
                    {
                        "type": "gets_function",
                        "severity": "critical",
                        "file_path": "src/input.cpp",
                        "line_number": 8,
                        "description": "Use of gets() - buffer overflow vulnerability",
                        "code_snippet": "gets(buffer);",
                        "recommendation": "Use fgets() or std::getline() instead of gets().",
                        "language": "cpp"
                    }
                ],
                "metadata": {
                    "scanner_version": "0.1.0",
                    "scan_type": "all",
                    "phase": "2 - Basic Regex Scanner",
                    "languages_supported": ["python", "javascript", "cpp"],
                    "files_scanned": 25,
                    "supported_extensions": [".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".cc", ".cxx", ".c++", ".c", ".h", ".hpp"]
                }
            }
        } 