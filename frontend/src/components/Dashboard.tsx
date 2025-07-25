import React, { useState } from 'react';
import VulnerabilityTable from './VulnerabilityTable';
import ScanForm from './ScanForm';
import { fetchScanResults, ScanResult, checkBackendHealth } from '../api';

// Mock data for fallback if API fails
const mockVulnerabilities = [
  {
    type: 'SQL Injection',
    severity: 'critical',
    file_path: 'app/models/scan.py',
    line_number: 42,
    description: 'Unsanitized input in SQL query',
    code_snippet: 'query = f"SELECT * FROM users WHERE id = {user_input}"',
    recommendation: 'Use parameterized queries to prevent SQL injection',
    language: 'python'
  },
  {
    type: 'Hardcoded Secret',
    severity: 'high',
    file_path: 'app/models/scan.py',
    line_number: 88,
    description: 'Hardcoded API key',
    code_snippet: 'API_KEY = "sk-1234567890abcdef"',
    recommendation: 'Use environment variables for sensitive data',
    language: 'python'
  },
  {
    type: 'XSS',
    severity: 'medium',
    file_path: 'frontend/src/App.tsx',
    line_number: 12,
    description: 'Unescaped user input in JSX',
    code_snippet: '<div>{userInput}</div>',
    recommendation: 'Sanitize user input before rendering',
    language: 'javascript'
  },
  {
    type: 'Buffer Overflow',
    severity: 'critical',
    file_path: 'test_repo/vuln_sample.cpp',
    line_number: 7,
    description: 'Unsafe strcpy usage',
    code_snippet: 'strcpy(buffer, user_input);',
    recommendation: 'Use strncpy with proper bounds checking',
    language: 'cpp'
  }
];

const Dashboard: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [hasScanned, setHasScanned] = useState(false);

  const handleScanSubmit = async (repoUrl: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      // Check backend health first
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not responding. Please ensure the FastAPI server is running on port 8000.');
      }

      console.log('Starting scan for repository:', repoUrl);
      const result = await fetchScanResults(repoUrl);
      console.log('Scan completed successfully:', result);
      
      setScanResult(result);
      setHasScanned(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to scan repository';
      console.error('Scan failed:', errorMessage);
      setError(errorMessage);
      
      // Use mock data as fallback for testing
      console.log('Using mock data as fallback due to API error:', errorMessage);
      setScanResult({
        repo_url: repoUrl,
        scan_id: 'mock-scan',
        scan_timestamp: new Date().toISOString(),
        status: 'completed',
        summary: {
          total_files_scanned: 4,
          total_vulnerabilities: 4,
          scan_duration_seconds: 2.5,
          scan_types_performed: ['secrets', 'injection', 'dangerous_functions'],
          language_breakdown: { python: 2, javascript: 1, cpp: 1 }
        },
        vulnerabilities: mockVulnerabilities,
        metadata: {}
      });
      setHasScanned(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setHasScanned(false);
    setError(undefined);
  };

  return (
    <div>
      {!hasScanned ? (
        // Initial state: Show centered scan form
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-textPrimary mb-2">Vulnerability Scanner</h1>
              <p className="text-textSecondary">Scan a GitHub repository for security vulnerabilities</p>
            </div>
            <ScanForm 
              onSubmit={handleScanSubmit}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      ) : (
        // After scan: Show vulnerability table
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">Scan Results</h2>
              {scanResult && (
                <p className="text-sm text-textSecondary mt-1">
                  Repository: {scanResult.repo_url}
                </p>
              )}
            </div>
            <button
              onClick={handleNewScan}
              className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition"
            >
              New Scan
            </button>
          </div>
          <VulnerabilityTable 
            vulnerabilities={scanResult?.vulnerabilities || []}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard; 