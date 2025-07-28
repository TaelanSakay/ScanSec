import React from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';
import { exportScanReport, exportCSVReport } from '../utils/reportGenerator';

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

interface ScanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanHistoryItem | null;
  vulnerabilities?: any[];
}

const ScanViewModal: React.FC<ScanViewModalProps> = ({ isOpen, onClose, scan, vulnerabilities = [] }) => {
  if (!isOpen || !scan) return null;

  const handleExportReport = () => {
    if (!scan || !vulnerabilities.length) {
      alert('No scan data available to export');
      return;
    }

    try {
      // Create a mock scan result for export
      const mockScanResult = {
        repo_url: scan.repo_url,
        scan_timestamp: scan.scan_timestamp,
        status: scan.status,
        summary: {
          total_files_scanned: 1,
          total_vulnerabilities: scan.total_vulnerabilities,
          scan_duration_seconds: scan.scan_duration,
          scan_types_performed: ['security'],
          language_breakdown: {}
        },
        vulnerabilities: vulnerabilities
      };

      exportScanReport(mockScanResult, vulnerabilities);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };

  const handleExportCSV = () => {
    if (!scan || !vulnerabilities.length) {
      alert('No scan data available to export');
      return;
    }

    try {
      // Create a mock scan result for export
      const mockScanResult = {
        repo_url: scan.repo_url,
        scan_timestamp: scan.scan_timestamp,
        status: scan.status,
        summary: {
          total_files_scanned: 1,
          total_vulnerabilities: scan.total_vulnerabilities,
          scan_duration_seconds: scan.scan_duration,
          scan_types_performed: ['security'],
          language_breakdown: {}
        },
        vulnerabilities: vulnerabilities
      };

      exportCSVReport(mockScanResult, vulnerabilities);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV report');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Scan Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scan Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Scan Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Repository:</span>
                <span className="ml-2 font-medium">{scan.repo_url}</span>
              </div>
              <div>
                <span className="text-gray-600">Scan Date:</span>
                <span className="ml-2 font-medium">{formatDate(scan.scan_timestamp)}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-medium">{scan.scan_duration}s</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{scan.status}</span>
              </div>
            </div>
          </div>

          {/* Vulnerability Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Vulnerability Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{scan.total_vulnerabilities}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{scan.critical_count}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{scan.high_count}</div>
                <div className="text-sm text-gray-600">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{scan.medium_count}</div>
                <div className="text-sm text-gray-600">Medium</div>
              </div>
            </div>
          </div>

          {/* Vulnerabilities List */}
          {vulnerabilities.length > 0 ? (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Vulnerabilities Found</h3>
              <div className="space-y-3">
                {vulnerabilities.map((vuln, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <h4 className="font-medium text-gray-900">{vuln.type}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">File:</span> {vuln.file_path}:{vuln.line_number}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Vulnerability Details</h3>
              <p className="text-gray-600">Detailed vulnerability information is not available for this scan.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
          {vulnerabilities.length > 0 && (
            <>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanViewModal; 