import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Reports</h1>
          <p className="text-textSecondary mt-1">View and export security scan reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Total Reports</p>
              <p className="text-2xl font-bold text-textPrimary">24</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            +12% from last month
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-status-critical/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Critical Issues</p>
              <p className="text-2xl font-bold text-textPrimary">8</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            +3 from last week
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">This Month</p>
              <p className="text-2xl font-bold text-textPrimary">12</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            +5 from last month
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Recent Reports</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-textPrimary">Security Scan Report - github.com/user/repo</p>
                  <p className="text-sm text-textSecondary">Generated 2 hours ago • 8 vulnerabilities found</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-status-critical text-white text-xs rounded">Critical</span>
                <button className="p-2 hover:bg-gray-200 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-textPrimary">Monthly Security Summary</p>
                  <p className="text-sm text-textSecondary">Generated 1 day ago • 15 vulnerabilities found</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-status-medium text-white text-xs rounded">Medium</span>
                <button className="p-2 hover:bg-gray-200 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-textPrimary">Weekly Vulnerability Report</p>
                  <p className="text-sm text-textSecondary">Generated 3 days ago • 6 vulnerabilities found</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-status-low text-white text-xs rounded">Low</span>
                <button className="p-2 hover:bg-gray-200 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 