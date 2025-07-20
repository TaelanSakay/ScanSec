#!/usr/bin/env python3
"""
Test script for ScanSec vulnerability scanner.

This script tests the enhanced scanner functionality with various test cases
including Python, JavaScript, and C++ files with known vulnerabilities.
"""

import os
import tempfile
import subprocess
import json
import time
from pathlib import Path

def create_test_files():
    """Create test files with known vulnerabilities for testing."""
    test_files = {
        'test_python.py': '''
# Test Python file with vulnerabilities
import pickle
import os
import subprocess
import urllib.request

# Dangerous eval usage
user_input = "print('hello')"
result = eval(user_input)

# Unsafe pickle usage
data = pickle.loads(user_data)

# Hardcoded secret
api_key = "sk-1234567890abcdef"
password = "secret123"

# SQL injection pattern
query = "SELECT * FROM users WHERE id = " + user_id
cursor.execute(query)

# Command injection
os.system("rm -rf /")

# Subprocess with shell=True
subprocess.run("echo " + user_input, shell=True)

# File operation without validation
with open(user_file, 'r') as f:
    data = f.read()

# Unsafe urllib usage
response = urllib.request.urlopen(user_url)

# Input function
user_data = input("Enter data: ")
''',
        'test_javascript.js': '''
// Test JavaScript file with vulnerabilities
const userData = document.getElementById('user-input').value;

// Dangerous eval usage
const result = eval(userData);

// XSS vulnerability
document.getElementById('content').innerHTML = userData;

// localStorage with sensitive data
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

// Unescaped user input
document.body.innerHTML = '<div>' + userData + '</div>';

// document.write
document.write(userData);

// sessionStorage with secrets
sessionStorage.setItem('password', 'secret123');

// setTimeout with string
setTimeout("alert('hello')", 1000);

// setInterval with string
setInterval("console.log('tick')", 1000);

// Location assignment
location.href = userUrl;

// Console logging secrets
console.log("API key: " + apiKey);
''',
        'test_cpp.cpp': '''
// Test C++ file with vulnerabilities
#include <iostream>
#include <cstring>
#include <cstdlib>
#include <cstdio>

int main() {
    char buffer[100];
    
    // Buffer overflow vulnerability
    gets(buffer);
    
    // Unsafe string copy
    char dest[50];
    strcpy(dest, "very long string that might overflow");
    
    // Unsafe string concatenation
    strcat(dest, "more text");
    
    // Command injection
    system("rm -rf /");
    
    // Hardcoded credentials
    std::string password = "secret123";
    
    // malloc without null check
    char* ptr = malloc(100);
    *ptr = 'a';  // Potential segfault
    
    // scanf without bounds checking
    scanf("%s", buffer);
    
    // printf with format string
    printf(user_format, user_data);
    
    // memcpy without bounds
    memcpy(dest, src, 1000);
    
    // sprintf without bounds
    sprintf(buffer, "Hello %s", user_input);
    
    // free after use
    free(ptr);
    *ptr = 'b';  // Use after free
    
    return 0;
}
''',
        'safe_file.py': '''
# This file should not trigger any vulnerabilities
import json
import os

def safe_function():
    """This function is safe and should not trigger any alerts."""
    data = {"key": "value"}
    return json.dumps(data)

# Environment variable usage (good practice)
api_key = os.getenv('API_KEY')
'''
    }
    
    return test_files

def test_local_scanning():
    """Test the scanner with local files."""
    print("🧪 Testing local file scanning...")
    
    # Create temporary directory with test files
    with tempfile.TemporaryDirectory() as temp_dir:
        test_files = create_test_files()
        
        # Write test files
        for filename, content in test_files.items():
            file_path = os.path.join(temp_dir, filename)
            with open(file_path, 'w') as f:
                f.write(content)
        
        # Test individual file scanning
        from app.routers.scan import scan_file, determine_language
        
        total_vulnerabilities = 0
        
        for filename in test_files.keys():
            file_path = os.path.join(temp_dir, filename)
            print(f"\n📁 Scanning {filename}...")
            
            # Determine language
            language = determine_language(file_path)
            print(f"   Language detected: {language}")
            
            # Scan for vulnerabilities
            vulnerabilities = scan_file(file_path)
            print(f"   Vulnerabilities found: {len(vulnerabilities)}")
            
            for vuln in vulnerabilities:
                print(f"     - {vuln.type} ({vuln.severity}): {vuln.description}")
                print(f"       Line {vuln.line_number}: {vuln.code_snippet.strip()}")
            
            total_vulnerabilities += len(vulnerabilities)
        
        print(f"\n✅ Local scanning test completed!")
        print(f"   Total vulnerabilities found: {total_vulnerabilities}")
        
        return total_vulnerabilities > 0  # Should find vulnerabilities

def test_api_endpoint():
    """Test the API endpoint with a mock repository."""
    print("\n🌐 Testing API endpoint...")
    
    try:
        import requests
        
        # Test health endpoint
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
            health_data = response.json()
            print(f"   Scanner version: {health_data.get('scanner_version')}")
            print(f"   Supported languages: {health_data.get('supported_languages')}")
        else:
            print("❌ Health endpoint failed")
            return False
            
    except ImportError:
        print("⚠️  requests library not available, skipping API test")
        return True
    except requests.exceptions.ConnectionError:
        print("⚠️  API server not running, skipping API test")
        return True

def test_file_discovery():
    """Test the file discovery functionality."""
    print("\n🔍 Testing file discovery...")
    
    from app.routers.scan import find_source_files
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a mock repository structure
        test_files = create_test_files()
        
        # Create subdirectories
        os.makedirs(os.path.join(temp_dir, 'src'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, 'frontend'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, '.git'), exist_ok=True)  # Should be ignored
        
        # Write files in different locations
        file_locations = {
            'test_python.py': temp_dir,
            'test_javascript.js': os.path.join(temp_dir, 'frontend'),
            'test_cpp.cpp': os.path.join(temp_dir, 'src'),
            'safe_file.py': temp_dir
        }
        
        for filename, location in file_locations.items():
            file_path = os.path.join(location, filename)
            with open(file_path, 'w') as f:
                f.write(test_files[filename])
        
        # Test file discovery
        discovered_files = find_source_files(temp_dir)
        
        print(f"   Files discovered: {len(discovered_files)}")
        for file_path in discovered_files:
            relative_path = os.path.relpath(file_path, temp_dir)
            print(f"     - {relative_path}")
        
        # Should find 4 files (excluding .git directory)
        expected_count = 4
        if len(discovered_files) == expected_count:
            print("✅ File discovery working correctly")
            return True
        else:
            print(f"❌ File discovery failed: expected {expected_count}, got {len(discovered_files)}")
            return False

def test_language_detection():
    """Test the language detection functionality."""
    print("\n🔤 Testing language detection...")
    
    from app.routers.scan import determine_language
    
    test_cases = [
        ('test.py', 'python'),
        ('script.js', 'javascript'),
        ('component.jsx', 'javascript'),
        ('app.ts', 'typescript'),
        ('main.cpp', 'cpp'),
        ('header.h', 'cpp'),
        ('unknown.txt', None),
        ('README.md', None)
    ]
    
    all_passed = True
    for filename, expected_language in test_cases:
        detected_language = determine_language(filename)
        status = "✅" if detected_language == expected_language else "❌"
        print(f"   {status} {filename} -> {detected_language} (expected: {expected_language})")
        if detected_language != expected_language:
            all_passed = False
    
    if all_passed:
        print("✅ Language detection working correctly")
    else:
        print("❌ Language detection has issues")
    
    return all_passed

def test_regex_patterns():
    """Test specific regex patterns for each language."""
    print("\n🔍 Testing regex patterns...")
    
    from app.routers.scan import scan_python_file, scan_js_file, scan_cpp_file
    
    # Test Python patterns
    python_content = '''
eval("print('hello')")
exec("import os")
pickle.loads(data)
os.system("rm -rf /")
api_key = "secret123"
'''
    python_vulns = scan_python_file("test.py", python_content)
    print(f"   Python vulnerabilities found: {len(python_vulns)}")
    
    # Test JavaScript patterns
    js_content = '''
eval(userData)
document.getElementById('content').innerHTML = userData
localStorage.setItem('token', 'secret')
setTimeout("alert('hello')", 1000)
'''
    js_vulns = scan_js_file("test.js", js_content)
    print(f"   JavaScript vulnerabilities found: {len(js_vulns)}")
    
    # Test C++ patterns
    cpp_content = '''
gets(buffer)
strcpy(dest, src)
system("rm -rf /")
password = "secret123"
malloc(100)
'''
    cpp_vulns = scan_cpp_file("test.cpp", cpp_content)
    print(f"   C++ vulnerabilities found: {len(cpp_vulns)}")
    
    total_vulns = len(python_vulns) + len(js_vulns) + len(cpp_vulns)
    if total_vulns > 0:
        print("✅ Regex patterns working correctly")
        return True
    else:
        print("❌ Regex patterns not detecting vulnerabilities")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting ScanSec Test Suite")
    print("=" * 50)
    
    tests = [
        ("Language Detection", test_language_detection),
        ("File Discovery", test_file_discovery),
        ("Regex Patterns", test_regex_patterns),
        ("Local Scanning", test_local_scanning),
        ("API Endpoint", test_api_endpoint)
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
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! ScanSec is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 