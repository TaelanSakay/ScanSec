import re

def scan_python_file(file_path: str, content: str):
    vulnerabilities = []
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        if re.search(r'\beval\s*\(', line):
            vulnerabilities.append({
                'type': 'eval',
                'severity': 'high',
                'file_path': file_path,
                'line_number': line_num,
                'description': 'Use of eval() - dangerous code execution',
                'code_snippet': line.strip(),
                'recommendation': 'Avoid eval(). Use safer alternatives like ast.literal_eval().',
                'language': 'python'
            })
        if re.search(r'\bexec\s*\(', line):
            vulnerabilities.append({
                'type': 'exec',
                'severity': 'high',
                'file_path': file_path,
                'line_number': line_num,
                'description': 'Use of exec() - dangerous code execution',
                'code_snippet': line.strip(),
                'recommendation': 'Avoid exec().',
                'language': 'python'
            })
    return vulnerabilities 