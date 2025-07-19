# ScanSec 

A lightweight **code vulnerability scanner** that helps developers and security-minded engineers quickly audit GitHub repositories for insecure code patterns.

##  Goals

ScanSec is designed for educational and small-team use, focusing on:
- **Transparency**: Clear, readable code that explains security concepts
- **Extensibility**: Easy to add new scanning patterns and rules
- **Local Execution**: No cloud dependencies, runs on your machine
- **Educational Value**: Helps developers understand common security pitfalls

##  What ScanSec Scans For

### Python (.py files)
- **Dangerous Code Execution**: `eval()`, `exec()` usage
- **Unsafe Deserialization**: `pickle.load()`, `pickle.loads()` usage
- **Hardcoded Secrets**: API keys, passwords, tokens in code

### JavaScript (.js files)
- **Dangerous Code Execution**: `eval()`, `Function()` usage
- **XSS Vulnerabilities**: Direct `innerHTML` assignments
- **Unescaped User Input**: User data directly inserted into DOM

### C++ (.cpp, .cc, .cxx files)
- **Buffer Overflow**: `gets()` usage (critical vulnerability)
- **Unsafe String Operations**: `strcpy()` without bounds checking
- **Command Injection**: `system()` calls with user input
- **Hardcoded Credentials**: Passwords and secrets in code

##  Tech Stack

- **Backend**: Python with FastAPI
- **Parsing/Scanning**: Built-in regex patterns for quick analysis
- **API Models**: Pydantic for request/response validation
- **Web Server**: Uvicorn for high-performance async serving
- **Future**: AST analysis, Docker containerization, GitHub API integration

##  Getting Started

### Prerequisites
- Python 3.8+
- pip
- git (for cloning repositories)

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

### Testing the Scanner
```bash
# Run the test script to verify functionality
python test_scanner.py
```

##  API Endpoints

- `POST /scan` - Scan a GitHub repository for vulnerabilities
- `GET /scan/{scan_id}` - Retrieve scan results by ID
- `GET /health` - Health check endpoint

##  Example Response

```json
{
  "repo_url": "https://github.com/user/repo",
  "scan_id": "scan_12345678",
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
    }
  ],
  "metadata": {
    "scanner_version": "0.1.0",
    "scan_type": "all",
    "phase": "2 - Basic Regex Scanner",
    "languages_supported": ["python", "javascript", "cpp"],
    "files_scanned": 25
  }
}
```

##  Future Enhancements

- **AST Analysis**: More accurate parsing using abstract syntax trees
- **Additional Languages**: Support for Java, Go, Rust, and more
- **Custom Rules**: User-defined scanning patterns
- **Integration**: GitHub Actions, CI/CD pipeline integration
- **Dashboard**: Web interface for viewing scan results

