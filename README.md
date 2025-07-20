# ScanSec 

A lightweight **code vulnerability scanner** that helps developers and security-minded engineers quickly audit GitHub repositories for insecure code patterns.

## 🎯 Goals

ScanSec is designed for educational and small-team use, focusing on:
- **Transparency**: Clear, readable code that explains security concepts
- **Extensibility**: Easy to add new scanning patterns and rules
- **Local Execution**: No cloud dependencies, runs on your machine
- **Educational Value**: Helps developers understand common security pitfalls

## 🔍 What ScanSec Scans For

### Python (.py files)
- **Dangerous Code Execution**: `eval()`, `exec()` usage
- **Unsafe Deserialization**: `pickle.load()`, `pickle.loads()` usage
- **Hardcoded Secrets**: API keys, passwords, tokens in code
- **SQL Injection**: String concatenation in SQL queries

### JavaScript (.js, .jsx, .ts, .tsx files)
- **Dangerous Code Execution**: `eval()`, `Function()` usage
- **XSS Vulnerabilities**: Direct `innerHTML` assignments
- **Unescaped User Input**: User data directly inserted into DOM
- **LocalStorage Secrets**: Sensitive data stored in localStorage

### C++ (.cpp, .cc, .cxx, .c++, .c, .h, .hpp files)
- **Buffer Overflow**: `gets()` usage (critical vulnerability)
- **Unsafe String Operations**: `strcpy()` without bounds checking
- **Command Injection**: `system()` calls with user input
- **Hardcoded Credentials**: Passwords and secrets in code
- **Memory Safety**: `malloc()` without null checks

## 🛠️ Tech Stack

- **Backend**: Python with FastAPI
- **Parsing/Scanning**: Built-in regex patterns for quick analysis
- **API Models**: Pydantic for request/response validation
- **Web Server**: Uvicorn for high-performance async serving
- **Future**: AST analysis, Docker containerization, GitHub API integration

## 🚀 Getting Started

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

#### API Usage
```bash
# Scan a GitHub repository
curl -X POST "http://localhost:8000/scan" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/user/repo"}'

# Check health status
curl "http://localhost:8000/health"
```

#### Testing
```bash
# Run the comprehensive test suite
python test_scanner.py

# Test API endpoints (requires server running)
python test_api.py
```

## 📋 API Endpoints

- `POST /scan` - Scan a GitHub repository for vulnerabilities
- `GET /scan/{scan_id}` - Retrieve scan results by ID (TODO: implement storage)
- `GET /health` - Health check endpoint

## 📊 Example Response

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
```

## 🔧 Enhanced Features

### ✅ Implemented
- **Multi-language Support**: Python, JavaScript, TypeScript, C++
- **Recursive File Discovery**: Automatically finds all supported files
- **Language-specific Scanning**: Routes files to appropriate scanners
- **Comprehensive Patterns**: Detects various vulnerability types
- **File Size Limits**: Skips files larger than 1MB for performance
- **Directory Filtering**: Ignores common directories (.git, node_modules, etc.)
- **Health Check Endpoint**: Monitor scanner status

### 🚧 In Progress / TODO

#### Phase 2 - AST Analysis
- [ ] Replace regex patterns with AST-based analysis
- [ ] More accurate vulnerability detection
- [ ] Reduced false positives

#### Phase 3 - External Tools Integration
- [ ] Bandit integration for Python
- [ ] ESLint security rules for JavaScript
- [ ] Clang Static Analyzer for C++
- [ ] Semgrep integration

#### Phase 4 - Advanced Features
- [ ] Custom rule engine
- [ ] Scan result storage and caching
- [ ] Incremental scanning
- [ ] Progress tracking
- [ ] Authentication for private repositories
- [ ] Docker containerization
- [ ] GitHub Actions integration

## 🧪 Testing

The project includes comprehensive test suites:

- **`test_scanner.py`**: Tests core scanning functionality
- **`test_api.py`**: Tests API endpoints
- **Local file scanning**: Tests with mock vulnerable files
- **Language detection**: Verifies correct language identification
- **File discovery**: Tests recursive file finding

## 📈 Performance

- **File Size Limit**: 1MB per file (configurable)
- **Timeout**: 5 minutes for repository cloning
- **Supported Extensions**: 12 file types across 4 languages
- **Directory Filtering**: Skips 8 common directories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

This project is for educational purposes. Use responsibly and always verify findings manually.

## 🔮 Future Roadmap

- **AST-based Analysis**: More accurate vulnerability detection
- **Machine Learning**: Pattern learning from codebases
- **CI/CD Integration**: GitHub Actions, GitLab CI
- **Web Dashboard**: Visual interface for scan results
- **Custom Rules**: User-defined scanning patterns
- **Multi-repo Scanning**: Batch scanning capabilities

