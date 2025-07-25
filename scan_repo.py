import argparse
import requests
import sys
import json

def main():
    parser = argparse.ArgumentParser(description="Scan a GitHub repo for code vulnerabilities using the ScanSec API.")
    parser.add_argument("repo_url", help="GitHub repository URL (public)")
    parser.add_argument("--api", default="http://localhost:3000/api/v1/scan-repo", help="ScanSec API endpoint URL")
    args = parser.parse_args()

    payload = {"repo_url": args.repo_url}
    try:
        resp = requests.post(args.api, json=payload, timeout=120)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        result = resp.json()
    except Exception:
        print("Error: Invalid JSON response from API", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(result, indent=2, sort_keys=True))

if __name__ == "__main__":
    main() 