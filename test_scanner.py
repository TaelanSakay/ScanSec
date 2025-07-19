#!/usr/bin/env python3
"""
Test script for ScanSec scanner functionality.
Creates sample files with vulnerabilities and tests the scanning logic.
"""

import os
import tempfile
from pathlib import Path
from app.routers.scan import (
    detect_python_vulnerabilities,
    detect_javascript_vulnerabilities,
    detect_cpp_vulnerabilities,
    find_source_files
)

def create_test_files():
    """Create test files with known vulnerabilities."""
    temp_dir = tempfile.mkdtemp()
    
    # Python test file with vulnerabilities
    python_content = '''# Test Python file with vulnerabilities
import pickle

# Dangerous eval usage
result = eval("2 + 2")

# Hardcoded secret
api_key = "AKIAIOSFODNN7EXAMPLE"

# Pickle usage
data = pickle.loads(user_input)

# Safe code
safe_var = "hello"
'''
    
    # JavaScript test file with vulnerabilities
    js_content = '''// Test JavaScript file with vulnerabilities
function processUserInput(userData) {
    // Dangerous eval usage
    eval(userData);
    
    // innerHTML assignment
    document.getElementById('output').innerHTML = userData;
    
    // Function constructor
    const func = new Function('return ' + userData);
    
    // Safe code
    const safeVar = "hello";
}
'''
    
    # C++ test file with vulnerabilities
    cpp_content = '''// Test C++ file with vulnerabilities
#include <iostream>
#include <cstring>

int main() {
    char buffer[100];
    
    // Dangerous gets usage
    gets(buffer);
    
    // Unsafe strcpy
    strcpy(buffer, "test");
    
    // System call
    system("rm -rf /");
    
    // Hardcoded credentials
    std::string password = "secret123";
    
    return 0;
}
'''
    
    # Write test files
    with open(os.path.join(temp_dir, 'test.py'), 'w') as f:
        f.write(python_content)
    
    with open(os.path.join(temp_dir, 'test.js'), 'w') as f:
        f.write(js_content)
    
    with open(os.path.join(temp_dir, 'test.cpp'), 'w') as f:
        f.write(cpp_content)
    
    return temp_dir

def test_scanner():
    """Test the scanner functionality."""
    print("🧪 Testing ScanSec Scanner...")
    
    # Create test files
    test_dir = create_test_files()
    print(f"📁 Created test files in: {test_dir}")
    
    # Test file discovery
    source_files = find_source_files(test_dir)
    print(f"📋 Found {len(source_files)} source files:")
    for file in source_files:
        print(f"  - {os.path.relpath(file, test_dir)}")
    
    # Test individual scanners
    print("\n🔍 Testing vulnerability detection:")
    
    # Test Python scanner
    with open(os.path.join(test_dir, 'test.py'), 'r') as f:
        python_content = f.read()
    python_vulns = detect_python_vulnerabilities('test.py', python_content)
    print(f"🐍 Python vulnerabilities found: {len(python_vulns)}")
    for vuln in python_vulns:
        print(f"  - {vuln.type}: {vuln.description} (line {vuln.line_number})")
    
    # Test JavaScript scanner
    with open(os.path.join(test_dir, 'test.js'), 'r') as f:
        js_content = f.read()
    js_vulns = detect_javascript_vulnerabilities('test.js', js_content)
    print(f"🟨 JavaScript vulnerabilities found: {len(js_vulns)}")
    for vuln in js_vulns:
        print(f"  - {vuln.type}: {vuln.description} (line {vuln.line_number})")
    
    # Test C++ scanner
    with open(os.path.join(test_dir, 'test.cpp'), 'r') as f:
        cpp_content = f.read()
    cpp_vulns = detect_cpp_vulnerabilities('test.cpp', cpp_content)
    print(f"🔵 C++ vulnerabilities found: {len(cpp_vulns)}")
    for vuln in cpp_vulns:
        print(f"  - {vuln.type}: {vuln.description} (line {vuln.line_number})")
    
    # Cleanup
    import shutil
    shutil.rmtree(test_dir)
    print(f"\n🧹 Cleaned up test directory")
    
    total_vulns = len(python_vulns) + len(js_vulns) + len(cpp_vulns)
    print(f"\n✅ Scanner test completed! Found {total_vulns} total vulnerabilities")

if __name__ == "__main__":
    test_scanner() 