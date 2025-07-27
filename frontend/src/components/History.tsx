import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Download, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../api';
import Toast, { ToastType } from './Toast';

interface ScanHistoryItem {
  id: number;
  repo_url: string;
  scan_timestamp: string;
  scan_duration: number;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  status: string;
}

const History: React.FC = () => {
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
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

  const fetchScanHistory = useCallback(async () => {
    try {
      setLoading(true);
      const history = await apiClient.getScanHistory();
      setScanHistory(history);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scan history');
      showToast(err.message || 'Failed to fetch scan history', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScanHistory();
  }, [fetchScanHistory]);

  const handleViewScan = async (scanId: number) => {
    try {
      await apiClient.getScanDetails(scanId);
      // TODO: Navigate to scan details or open modal
      showToast('Scan details loaded', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to load scan details', 'error');
    }
  };

  const handleExportScan = (scan: ScanHistoryItem) => {
    // TODO: Implement scan export
    showToast('Export functionality coming soon', 'success');
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Scan History</h1>
            <p className="text-textSecondary mt-1">View your previous security scans</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-textSecondary">Loading scan history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Scan History</h1>
            <p className="text-textSecondary mt-1">View your previous security scans</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textPrimary mb-2">Error Loading History</h3>
            <p className="text-textSecondary">{error}</p>
            <button
              onClick={fetchScanHistory}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Scan History</h1>
          <p className="text-textSecondary mt-1">
            {scanHistory.length} scan{scanHistory.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {scanHistory.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textPrimary mb-2">No Scan History</h3>
            <p className="text-textSecondary">Run your first scan to see history here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {scanHistory.map((scan) => (
            <div key={scan.id} className="bg-card rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(scan.status)}
                    <h3 className="text-lg font-semibold text-textPrimary">
                      {scan.repo_url}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(scan.status)}`}>
                      {scan.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-textSecondary">Scan Date</p>
                      <p className="font-medium">{formatDate(scan.scan_timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-textSecondary">Duration</p>
                      <p className="font-medium">{formatDuration(scan.scan_duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-textSecondary">Total Vulnerabilities</p>
                      <p className="font-medium">{scan.total_vulnerabilities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-textSecondary">Critical Issues</p>
                      <p className="font-medium text-status-critical">{scan.critical_count}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-textSecondary">High:</span>
                      <span className="font-medium text-status-high">{scan.high_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-textSecondary">Medium:</span>
                      <span className="font-medium text-status-medium">{scan.medium_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-textSecondary">Low:</span>
                      <span className="font-medium text-status-low">{scan.low_count}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewScan(scan.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleExportScan(scan)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History; 