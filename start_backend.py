#!/usr/bin/env python3
"""
ScanSec Backend Startup Script
==============================

This script starts the FastAPI backend server with proper configuration.

Usage:
    python start_backend.py

Requirements:
    - Python 3.8+
    - FastAPI
    - uvicorn
    - gitpython (for repository cloning)
"""

import sys
import subprocess
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = ['fastapi', 'uvicorn', 'gitpython']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing dependencies: {', '.join(missing_packages)}")
        print("Install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All dependencies are installed")
    return True

def check_git():
    """Check if git is available in the system."""
    try:
        result = subprocess.run(['git', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"✅ Git is available: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Git is not installed or not in PATH")
        print("Please install Git: https://git-scm.com/downloads")
        return False

def start_server():
    """Start the FastAPI server."""
    print("\n🚀 Starting ScanSec Backend Server...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("app/main.py").exists():
        print("❌ Error: app/main.py not found")
        print("Please run this script from the ScanSec project root directory")
        return False
    
    # Start the server
    try:
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ]
        
        print(f"Running: {' '.join(cmd)}")
        print("\n📋 Server Information:")
        print("   • URL: http://127.0.0.1:8000")
        print("   • Health Check: http://127.0.0.1:8000/health")
        print("   • API Docs: http://127.0.0.1:8000/docs")
        print("   • Scan Endpoint: POST http://127.0.0.1:8000/scan-repo")
        print("\n🔄 Server is starting... (Press Ctrl+C to stop)")
        print("=" * 50)
        
        subprocess.run(cmd, check=True)
        return True
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main function."""
    print("ScanSec Backend Startup")
    print("=" * 30)
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Check git
    if not check_git():
        print("\n⚠️ Warning: Git is required for repository cloning")
        print("The server will start but scan functionality may be limited")
    
    # Start server
    if start_server():
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main()) 