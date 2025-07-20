#!/usr/bin/env python3
"""
API test script for ScanSec vulnerability scanner.

This script tests the API endpoints to ensure they're working correctly.
"""

import requests
import json
import time

def test_health_endpoint():
    """Test the health check endpoint."""
    print("🏥 Testing health endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        print("   Make sure the server is running with: uvicorn app.main:app --reload")
        return False

def test_scan_endpoint():
    """Test the scan endpoint with a public repository."""
    print("\n🔍 Testing scan endpoint...")
    
    # Use a small public repository for testing
    test_repo = "https://github.com/octocat/Hello-World"
    
    scan_data = {
        "repo_url": test_repo,
        "scan_type": "all"
    }
    
    try:
        print(f"   Scanning repository: {test_repo}")
        response = requests.post(
            "http://localhost:8000/api/v1/scan",
            json=scan_data,
            timeout=60  # 60 second timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Scan completed successfully")
            print(f"   Scan ID: {result.get('scan_id')}")
            print(f"   Files scanned: {result.get('summary', {}).get('total_files_scanned', 0)}")
            print(f"   Vulnerabilities found: {result.get('summary', {}).get('total_vulnerabilities', 0)}")
            print(f"   Duration: {result.get('summary', {}).get('scan_duration_seconds', 0):.2f}s")
            
            # Show some vulnerabilities if found
            vulnerabilities = result.get('vulnerabilities', [])
            if vulnerabilities:
                print("\n   Found vulnerabilities:")
                for vuln in vulnerabilities[:3]:  # Show first 3
                    print(f"     - {vuln.get('type')} ({vuln.get('severity')}): {vuln.get('description')}")
                    print(f"       File: {vuln.get('file_path')}:{vuln.get('line_number')}")
            else:
                print("   No vulnerabilities found (this is good!)")
            
            return True
        else:
            print(f"❌ Scan failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Scan timed out (repository might be too large)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        return False

def test_scan_result_endpoint():
    """Test the scan result retrieval endpoint."""
    print("\n📋 Testing scan result endpoint...")
    
    # This endpoint is not implemented yet, so we expect a 404
    try:
        response = requests.get("http://localhost:8000/api/v1/scan/test_scan_id")
        if response.status_code == 404:
            print("✅ Scan result endpoint correctly returns 404 (not implemented yet)")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        return False

def test_root_endpoint():
    """Test the root endpoint."""
    print("\n🏠 Testing root endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Root endpoint working")
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        return False

def main():
    """Run all API tests."""
    print("🚀 Starting ScanSec API Test Suite")
    print("=" * 50)
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Health Endpoint", test_health_endpoint),
        ("Scan Endpoint", test_scan_endpoint),
        ("Scan Result Endpoint", test_scan_result_endpoint)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 API Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All API tests passed! ScanSec API is working correctly.")
    else:
        print("⚠️  Some API tests failed. Please check the server and implementation.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 