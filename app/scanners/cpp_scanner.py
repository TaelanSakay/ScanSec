import re

def scan_cpp_file(file_path: str, content: str):
    vulnerabilities = []
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        if re.search(r'\bsystem\s*\(', line):
            vulnerabilities.append({
                'type': 'system',
                'severity': 'high',
                'file_path': file_path,
                'line_number': line_num,
                'description': 'Use of system() - dangerous command execution',
                'code_snippet': line.strip(),
                'recommendation': 'Avoid system(). Use safer APIs.',
                'language': 'cpp'
            })
        if re.search(r'\bexec\s*\(', line):
            vulnerabilities.append({
                'type': 'exec',
                'severity': 'high',
                'file_path': file_path,
                'line_number': line_num,
                'description': 'Use of exec() - dangerous command execution',
                'code_snippet': line.strip(),
                'recommendation': 'Avoid exec().',
                'language': 'cpp'
            })
    return vulnerabilities 