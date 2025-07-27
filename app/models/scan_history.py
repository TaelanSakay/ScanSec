from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repo_url = Column(String, nullable=False)
    scan_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    scan_duration = Column(Integer, default=0)  # Duration in seconds
    total_vulnerabilities = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    scan_summary = Column(JSON)  # Store detailed scan summary
    vulnerabilities = Column(JSON)  # Store vulnerability data
    status = Column(String, default="completed")  # completed, failed, in_progress
    
    # Relationship to User
    user = relationship("User", back_populates="scan_history")

    def to_dict(self):
        """Convert scan history to dictionary for API response."""
        return {
            "id": self.id,
            "repo_url": self.repo_url,
            "scan_timestamp": self.scan_timestamp.isoformat() if self.scan_timestamp else None,
            "scan_duration": self.scan_duration,
            "total_vulnerabilities": self.total_vulnerabilities,
            "critical_count": self.critical_count,
            "high_count": self.high_count,
            "medium_count": self.medium_count,
            "low_count": self.low_count,
            "scan_summary": self.scan_summary,
            "vulnerabilities": self.vulnerabilities,
            "status": self.status
        } 