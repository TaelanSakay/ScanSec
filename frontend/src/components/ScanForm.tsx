import React, { useState } from 'react';
import { Search, AlertCircle, Shield } from 'lucide-react';

export interface ScanFormProps {
  onSubmit: (repoUrl: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

const ScanForm: React.FC<ScanFormProps> = ({ onSubmit, loading, error }) => {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    await onSubmit(repoUrl.trim());
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Security Scan</h2>
        <p className="text-textSecondary">Enter a GitHub repository URL to scan for vulnerabilities</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-textSecondary mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              disabled={loading}
            />
          </div>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-status-critical text-sm bg-status-critical/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || !repoUrl.trim()}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Scanning Repository...
            </div>
          ) : (
            'Start Security Scan'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-textSecondary">
          Supported languages: Python, JavaScript, TypeScript, C++, C
        </p>
      </div>
    </div>
  );
};

export default ScanForm; 