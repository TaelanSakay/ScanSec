import React from 'react';
import { Shield, Filter, Search } from 'lucide-react';

const Vulnerabilities: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Vulnerabilities</h1>
          <p className="text-textSecondary mt-1">Manage and review all security findings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-critical/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Critical</p>
              <p className="text-2xl font-bold text-textPrimary">12</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-high/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-status-high" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">High</p>
              <p className="text-2xl font-bold text-textPrimary">8</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-medium/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-status-medium" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Medium</p>
              <p className="text-2xl font-bold text-textPrimary">15</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-low/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-status-low" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Low</p>
              <p className="text-2xl font-bold text-textPrimary">23</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Recent Scans</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-textPrimary">github.com/user/repo</p>
                <p className="text-sm text-textSecondary">2 hours ago • 8 vulnerabilities found</p>
              </div>
              <span className="px-2 py-1 bg-status-critical text-white text-xs rounded">Critical</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-textPrimary">github.com/org/project</p>
                <p className="text-sm text-textSecondary">1 day ago • 3 vulnerabilities found</p>
              </div>
              <span className="px-2 py-1 bg-status-medium text-white text-xs rounded">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities; 