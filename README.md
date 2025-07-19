# ScanSec 

A lightweight **code vulnerability scanner** that helps developers and security-minded engineers quickly audit GitHub repositories for insecure code patterns.

##  Goals

ScanSec is designed for educational and small-team use, focusing on:
- **Transparency**: Clear, readable code that explains security concepts
- **Extensibility**: Easy to add new scanning patterns and rules
- **Local Execution**: No cloud dependencies, runs on your machine
- **Educational Value**: Helps developers understand common security pitfalls

##  What ScanSec Scans For

- **Hardcoded Secrets**: AWS keys, API tokens, passwords in code
- **Dangerous Functions**: `eval()`, `exec()`, `os.system()` usage
- **SQL Injection Patterns**: Unsanitized database queries
- **Insecure HTTP Requests**: Non-TLS endpoints, missing security headers
- **LLM Prompt Injection**: Potential injection patterns in Python comments/strings

##  Tech Stack

- **Backend**: Python with FastAPI
- **Parsing/Scanning**: Built-in regex and AST (abstract syntax tree) analysis
- **API Models**: Pydantic for request/response validation
- **Web Server**: Uvicorn for high-performance async serving
- **Future**: Docker containerization, GitHub API integration

##  Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ScanSec

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload
```

### Usage
```bash
# Scan a GitHub repository
curl -X POST "http://localhost:8000/scan" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/user/repo"}'
```

##  API Endpoints

- `POST /scan` - Scan a GitHub repository for vulnerabilities
- `GET /health` - Health check endpoint

