import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { Link } from 'react-router-dom';
import { exportScanReport, exportCSVReport } from '../utils/reportGenerator';
import Toast, { ToastType } from './Toast';

const Reports: React.FC = () => {
  const { currentScan, vulnerabilities } = useScanContext();
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

  // Calculate real statistics from scan data
  const getScanStats = () => {
    if (!currentScan || !vulnerabilities.length) {
      return {
        totalVulnerabilities: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        filesScanned: currentScan?.summary?.total_files_scanned || 0,
        scanDuration: currentScan?.summary?.scan_duration_seconds || 0,
      };
    }

    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    vulnerabilities.forEach(vuln => {
      const severity = vuln.severity.toLowerCase();
      if (severity in counts) {
        counts[severity as keyof typeof counts]++;
      }
    });

    return {
      totalVulnerabilities: vulnerabilities.length,
      criticalIssues: counts.critical,
      highIssues: counts.high,
      mediumIssues: counts.medium,
      lowIssues: counts.low,
      filesScanned: currentScan.summary?.total_files_scanned || 0,
      scanDuration: currentScan.summary?.scan_duration_seconds || 0,
    };
  };

  const handleExportReport = () => {
    if (!currentScan) {
      showToast('No scan data available to export', 'error');
      return;
    }

    try {
      exportScanReport(currentScan, vulnerabilities);
      showToast('Report exported successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export report', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!currentScan) {
      showToast('No scan data available to export', 'error');
      return;
    }

    try {
      exportCSVReport(currentScan, vulnerabilities);
      showToast('CSV report exported successfully!', 'success');
    } catch (error) {
      console.error('CSV export failed:', error);
      showToast('Failed to export CSV report', 'error');
    }
  };

  const stats = getScanStats();

  if (!currentScan) {
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
            <h1 className="text-2xl font-bold text-textPrimary">Reports</h1>
            <p className="text-textSecondary mt-1">View and export security scan reports</p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Search className="w-4 h-4" />
            New Scan
          </Link>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textPrimary mb-2">No Scan Data</h3>
            <p className="text-textSecondary">Run a scan from the Dashboard to view reports</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Search className="w-4 h-4" />
              Start New Scan
            </Link>
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
          <h1 className="text-2xl font-bold text-textPrimary">Reports</h1>
          <p className="text-textSecondary mt-1">View and export security scan reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Search className="w-4 h-4" />
            New Scan
          </Link>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Total Vulnerabilities</p>
              <p className="text-2xl font-bold text-textPrimary">{stats.totalVulnerabilities}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            Found in {stats.filesScanned} files
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-status-critical/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Critical Issues</p>
              <p className="text-2xl font-bold text-textPrimary">{stats.criticalIssues}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            {stats.criticalIssues > 0 ? 'Requires immediate attention' : 'No critical issues'}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Scan Duration</p>
              <p className="text-2xl font-bold text-textPrimary">{stats.scanDuration}s</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            Completed successfully
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Scan Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-textPrimary">Security Scan Report - {currentScan.repo_url}</p>
                  <p className="text-sm text-textSecondary">
                    Generated {currentScan.scan_timestamp ? new Date(currentScan.scan_timestamp).toLocaleString() : 'Recently'} • {stats.totalVulnerabilities} vulnerabilities found
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-white text-xs rounded ${
                  stats.criticalIssues > 0 ? 'bg-status-critical' :
                  stats.highIssues > 0 ? 'bg-status-high' :
                  stats.mediumIssues > 0 ? 'bg-status-medium' :
                  'bg-status-low'
                }`}>
                  {stats.criticalIssues > 0 ? 'Critical' :
                   stats.highIssues > 0 ? 'High' :
                   stats.mediumIssues > 0 ? 'Medium' : 'Low'}
                </span>
                <button 
                  onClick={handleExportReport}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentScan.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-textPrimary mb-2">Scan Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Files Scanned:</span>
                      <span className="font-medium">{stats.filesScanned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Scan Duration:</span>
                      <span className="font-medium">{stats.scanDuration} seconds</span>
                    </div>
                    {currentScan.summary.scan_types_performed && (
                      <div className="flex justify-between">
                        <span className="text-textSecondary">Scan Types:</span>
                        <span className="font-medium">{currentScan.summary.scan_types_performed.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-textPrimary mb-2">Vulnerability Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Critical:</span>
                      <span className="font-medium text-status-critical">{stats.criticalIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">High:</span>
                      <span className="font-medium text-status-high">{stats.highIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Medium:</span>
                      <span className="font-medium text-status-medium">{stats.mediumIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textSecondary">Low:</span>
                      <span className="font-medium text-status-low">{stats.lowIssues}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 