from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Vulnerability(BaseModel):
    """
    Represents a single vulnerability finding.
    
    Attributes:
        type: The type of vulnerability (e.g., 'hardcoded_secret', 'sql_injection')
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
                "type": "hardcoded_secret",
                "severity": "high",
                "file_path": "config/database.py",
                "line_number": 15,
                "description": "AWS access key found in code",
                "code_snippet": "aws_key = 'AKIAIOSFODNN7EXAMPLE'",
                "recommendation": "Use environment variables or AWS IAM roles instead",
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
    """
    total_files_scanned: int = Field(..., description="Number of files processed")
    total_vulnerabilities: int = Field(..., description="Total vulnerabilities found")
    scan_duration_seconds: float = Field(..., description="Scan duration in seconds")
    scan_types_performed: List[str] = Field(..., description="Types of scans performed")

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
        metadata: Additional scan metadata
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
                    "total_files_scanned": 150,
                    "total_vulnerabilities": 3,
                    "scan_duration_seconds": 45.2,
                    "scan_types_performed": ["secrets", "injection", "dangerous_functions"]
                },
                "vulnerabilities": [],
                "metadata": {
                    "scanner_version": "0.1.0",
                    "scan_type": "all"
                }
            }
        } 