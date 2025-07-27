import React, { useState, useEffect } from 'react';
import VulnerabilityTable from './VulnerabilityTable';
import ScanForm from './ScanForm';
import apiClient from '../api';
import { useScanContext } from '../context/ScanContext';
import Toast, { ToastType } from './Toast';

const Dashboard: React.FC = () => {
  console.log("Dashboard rendered");
  
  const { currentScan, setCurrentScan, vulnerabilities, setVulnerabilities, hasScanData } = useScanContext();
  
  // Add test vulnerabilities for debugging
  useEffect(() => {
    if (!hasScanData) {
      const testVulnerabilities = [
        {
          id: 'test-1',
          type: 'sql_injection',
          severity: 'high',
          file_path: 'test.py',
          line_number: 15,
          description: 'Potential SQL injection vulnerability',
          code_snippet: 'query = "SELECT * FROM users WHERE id = " + user_input',
          language: 'python'
        },
        {
          id: 'test-2',
          type: 'eval_exec',
          severity: 'critical',
          file_path: 'script.js',
          line_number: 42,
          description: 'Dangerous eval() usage',
          code_snippet: 'eval(userInput)',
          language: 'javascript'
        }
      ];
      
      // Set test data for debugging
      setVulnerabilities(testVulnerabilities);
      setCurrentScan({
        repo_url: 'https://github.com/test/repo',
        scan_id: 'test-scan',
        scan_timestamp: new Date().toISOString(),
        status: 'completed',
        vulnerabilities: testVulnerabilities,
        summary: {
          total_files_scanned: 2,
          total_vulnerabilities: 2,
          scan_duration_seconds: 1,
          scan_types_performed: ['test'],
          language_breakdown: { python: 1, javascript: 1 }
        }
      });
    }
  }, [hasScanData, setVulnerabilities, setCurrentScan]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  console.log("Dashboard state:", { 
    scanHistory, 
    historyLoading, 
    hasScanData, 
    currentScan: !!currentScan,
    error 
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Fetch scan history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log("Fetching scan history...");
        setHistoryLoading(true);
        const history = await apiClient.getScanHistory();
        console.log("Scan history API response:", history);
        console.log("Scan history type:", typeof history);
        console.log("Scan history length:", Array.isArray(history) ? history.length : 'not array');
        setScanHistory(history);
        console.log("setScanHistory called with:", history);
      } catch (err: any) {
        console.error('Failed to fetch scan history:', err);
        // Don't show error toast for history fetch on mount
      } finally {
        setHistoryLoading(false);
        console.log("History loading set to false");
      }
    };

    fetchHistory();
  }, []);

  const handleScanSubmit = async (repoUrl: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      // Check backend health first
      const isHealthy = await apiClient.checkBackendHealth();
      if (!isHealthy) {
        throw new Error('Backend server is not responding. Please ensure the FastAPI server is running on port 8000.');
      }

      console.log('Starting scan for repository:', repoUrl);
      showToast('Starting scan...', 'success');
      
      const result = await apiClient.fetchScanResults(repoUrl);
      console.log('Scan completed successfully:', result);
      
      setCurrentScan(result);
      setVulnerabilities(result.vulnerabilities);
      showToast(`Scan completed! Found ${result.vulnerabilities.length} vulnerabilities.`, 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to scan repository';
      console.error('Scan failed:', errorMessage);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setCurrentScan(null);
    setVulnerabilities([]);
    setError(undefined);
    showToast('Ready for new scan', 'success');
  };

  // Error boundary fallback
  if (error && !hasScanData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-textPrimary mb-2">Error Loading Dashboard</h3>
          <p className="text-textSecondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {!hasScanData ? (
        // Show scan form and recent history
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Welcome to ScanSec</h1>
            <p className="text-textSecondary">Scan a GitHub repository for security vulnerabilities</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <ScanForm 
              onSubmit={handleScanSubmit}
              loading={loading}
              error={error}
            />
          </div>

          {/* Recent Scan History */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">Recent Scans</h2>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-textSecondary">Loading recent scans...</span>
              </div>
            ) : scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-textPrimary mb-1">No scans yet</h3>
                <p className="text-textSecondary">Run your first scan to see results here</p>
                <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
                  <strong>Debug Info:</strong><br/>
                  scanHistory length: {scanHistory.length}<br/>
                  scanHistory type: {typeof scanHistory}<br/>
                  scanHistory: <pre>{JSON.stringify(scanHistory, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-blue-100 rounded text-xs">
                  <strong>Debug - Found {scanHistory.length} scans:</strong><br/>
                  <pre>{JSON.stringify(scanHistory.slice(0, 2), null, 2)}</pre>
                </div>
                {scanHistory.slice(0, 3).map((scan) => (
                  <div key={scan.id} className="bg-card rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-textPrimary">{scan.repo_url}</h3>
                        <p className="text-sm text-textSecondary">
                          {new Date(scan.scan_timestamp).toLocaleDateString()} - {scan.total_vulnerabilities} vulnerabilities
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        scan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // After scan: Show vulnerability table
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">Scan Results</h2>
              {currentScan && (
                <p className="text-sm text-textSecondary mt-1">
                  Repository: {currentScan.repo_url}
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
            vulnerabilities={vulnerabilities}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard; 