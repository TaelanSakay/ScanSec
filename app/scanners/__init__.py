from .python_scanner import scan_python_file
from .js_scanner import scan_js_file
from .cpp_scanner import scan_cpp_file

def scan_file_by_language(file_path: str, content: str, language: str):
    if language == 'python':
        return scan_python_file(file_path, content)
    elif language == 'javascript':
        return scan_js_file(file_path, content)
    elif language == 'cpp':
        return scan_cpp_file(file_path, content)
    else:
        return [] 