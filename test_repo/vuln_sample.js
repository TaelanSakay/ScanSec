// JavaScript sample with vulnerabilities
function runUserCode(code) {
    return Function(code)(); // Insecure: Function constructor
} 