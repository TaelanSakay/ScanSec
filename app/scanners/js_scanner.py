import re

def scan_js_file(file_path: str, content: str):
    vulnerabilities = []
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        if re.search(r'\bFunction\s*\(', line):
            vulnerabilities.append({
                'type': 'Function',
                'severity': 'high',
                'file_path': file_path,
                'line_number': line_num,
                'description': 'Use of Function() constructor - dangerous code execution',
                'code_snippet': line.strip(),
                'recommendation': 'Avoid Function().',
                'language': 'javascript'
            })
    return vulnerabilities 