# ScanSec Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Git installed and in PATH
- pip package manager

### Installation

1. **Install Dependencies:**
   ```bash
   pip install fastapi uvicorn gitpython
   ```

2. **Start the Server:**
   ```bash
   # Option 1: Using the startup script (recommended)
   python start_backend.py
   
   # Option 2: Direct uvicorn command
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   
   # Option 3: Using main.py
   python app/main.py
   ```

## 📋 Server Information

Once started, the server will be available at:

- **Base URL:** http://127.0.0.1:8000
- **Health Check:** http://127.0.0.1:8000/health
- **API Documentation:** http://127.0.0.1:8000/docs
- **Scan Endpoint:** POST http://127.0.0.1:8000/scan-repo

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# API Configuration
API_BASE_URL=http://127.0.0.1:8000

# Development Settings
DEBUG=true
LOG_LEVEL=info
```

### CORS Configuration
The backend is configured to accept requests from:
- http://localhost:3000 (React frontend)

## 🧪 Testing the Backend

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Test Scan Endpoint
```bash
# PowerShell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/scan-repo" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"repo_url": "https://github.com/octocat/Hello-World"}'

# Bash/Linux
curl -X POST "http://127.0.0.1:8000/scan-repo" \
     -H "Content-Type: application/json" \
     -d '{"repo_url": "https://github.com/octocat/Hello-World"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'git'"**
   ```bash
   pip install gitpython
   ```

2. **"Address already in use"**
   ```bash
   # Find and kill the process using port 8000
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

3. **"Git is not installed"**
   - Download and install Git from: https://git-scm.com/downloads
   - Ensure Git is in your system PATH

4. **Import errors with app modules**
   ```bash
   # Ensure you're in the correct directory
   cd ScanSec/ScanSec
   
   # Check Python path
   python -c "import sys; print(sys.path)"
   ```

### Debug Mode
Start with debug logging:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug
```

## 📁 Project Structure

```
ScanSec/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── routers/
│   │   ├── __init__.py
│   │   └── scan.py          # Scan endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── scan.py          # Data models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── scan_result.py   # Pydantic schemas
│   └── scanners/
│       ├── __init__.py
│       ├── python_scanner.py
│       ├── js_scanner.py
│       └── cpp_scanner.py
├── start_backend.py         # Startup script
└── BACKEND_SETUP.md         # This file
```

## 🔄 Development Workflow

1. **Start the backend:**
   ```bash
   python start_backend.py
   ```

2. **Start the frontend (in another terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the full stack:**
   - Open http://localhost:3000
   - Enter a GitHub repo URL
   - Click "Start Security Scan"

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint with project info |
| GET | `/health` | Health check |
| POST | `/scan-repo` | Scan a GitHub repository |
| GET | `/docs` | Interactive API documentation |

## 🛡️ Security Notes

- Only public GitHub repositories are supported
- Repository cloning is done in temporary directories
- File size limits are enforced (1MB default)
- CORS is configured for development only

## 📝 Logs

The server logs will show:
- Startup information
- Request/response details
- Error messages
- Import warnings

Check the console output for detailed information about server status and any issues. 