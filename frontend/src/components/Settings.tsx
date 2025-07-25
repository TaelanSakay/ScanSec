import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Key } from 'lucide-react';
import config from '../config';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Settings</h1>
        <p className="text-textSecondary mt-1">Configure your vulnerability scanner preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Settings */}
        <div className="bg-card rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Scanner Settings</h2>
                <p className="text-sm text-textSecondary">Configure scan behavior and rules</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Scan Depth
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Shallow (Recommended)</option>
                  <option>Deep</option>
                  <option>Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  File Size Limit
                </label>
                <input
                  type="number"
                  defaultValue="1024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-textSecondary mt-1">Maximum file size in KB</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Enable Advanced Rules</p>
                  <p className="text-xs text-textSecondary">Use custom vulnerability patterns</p>
                </div>
                <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-1"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Notifications</h2>
                <p className="text-sm text-textSecondary">Configure alert preferences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Critical Vulnerabilities</p>
                  <p className="text-xs text-textSecondary">Get notified for critical findings</p>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Scan Completion</p>
                  <p className="text-xs text-textSecondary">Notify when scans finish</p>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Weekly Reports</p>
                  <p className="text-xs text-textSecondary">Send weekly summary emails</p>
                </div>
                <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-1"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-card rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">API Configuration</h2>
                <p className="text-sm text-textSecondary">Manage API keys and endpoints</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  API Base URL
                </label>
                <input
                  type="url"
                  defaultValue={config.API_BASE_URL}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-textSecondary mt-1">Current: {config.API_BASE_URL}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                Test Connection
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Data Management</h2>
                <p className="text-sm text-textSecondary">Manage scan history and data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Auto-cleanup</p>
                  <p className="text-xs text-textSecondary">Remove old scan data</p>
                </div>
                <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-1"></div>
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Retention Period
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              
              <button className="w-full px-4 py-2 bg-status-critical text-white rounded-lg hover:bg-status-critical/90 transition">
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 