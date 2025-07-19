from typing import Optional
from pydantic import BaseModel, HttpUrl, Field

class ScanRequest(BaseModel):
    """
    Request model for scanning a GitHub repository.
    
    Attributes:
        repo_url: The GitHub repository URL to scan
        scan_type: Optional scan type filter (e.g., 'secrets', 'injection', 'all')
    """
    repo_url: HttpUrl = Field(
        ..., 
        description="GitHub repository URL to scan",
        example="https://github.com/user/repository"
    )
    scan_type: Optional[str] = Field(
        default="all",
        description="Type of scan to perform",
        example="secrets"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "repo_url": "https://github.com/user/repository",
                "scan_type": "all"
            }
        } 