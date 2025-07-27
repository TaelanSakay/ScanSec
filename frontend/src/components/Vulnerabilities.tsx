import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, AlertCircle } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { Vulnerability } from '../api';
import VulnerabilityFilters, { FilterOptions } from './VulnerabilityFilters';

const Vulnerabilities: React.FC = () => {
  const { vulnerabilities, currentScan } = useScanContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVulns, setFilteredVulns] = useState<Vulnerability[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    severity: [],
    language: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate vulnerability counts by severity
  const getVulnerabilityCounts = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    vulnerabilities.forEach(vuln => {
      const severity = vuln.severity.toLowerCase();
      if (severity in counts) {
        counts[severity as keyof typeof counts]++;
      }
    });
    return counts;
  };

  // Get available filter options
  const availableOptions = React.useMemo(() => {
    const severities = Array.from(new Set(vulnerabilities.map(v => v.severity)));
    const languages = Array.from(new Set(vulnerabilities.map(v => v.language || 'Unknown')));
    const statuses = ['Open', 'In Progress', 'Resolved']; // Default statuses
    
    return {
      severities,
      languages,
      statuses,
    };
  }, [vulnerabilities]);

  // Filter vulnerabilities based on search term and filters
  useEffect(() => {
    let filtered = vulnerabilities.filter(vuln => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        vuln.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vuln.file_path.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(vuln.severity)) {
        return false;
      }
      
      // Language filter
      const vulnLanguage = vuln.language || 'Unknown';
      if (filters.language.length > 0 && !filters.language.includes(vulnLanguage)) {
        return false;
      }
      
      // Status filter (using default 'Open' status for now)
      if (filters.status.length > 0 && !filters.status.includes('Open')) {
        return false;
      }
      
      return true;
    });
    
    setFilteredVulns(filtered);
  }, [vulnerabilities, searchTerm, filters]);

  const counts = getVulnerabilityCounts();

  if (!currentScan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Vulnerabilities</h1>
            <p className="text-textSecondary mt-1">Manage and review all security findings</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-textPrimary mb-2">No Scan Data</h3>
            <p className="text-textSecondary">Run a scan from the Dashboard to view vulnerabilities</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Vulnerabilities</h1>
          <p className="text-textSecondary mt-1">
            {filteredVulns.length} of {vulnerabilities.length} vulnerabilities found in {currentScan.repo_url}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <VulnerabilityFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableSeverities={availableOptions.severities}
          availableLanguages={availableOptions.languages}
          availableStatuses={availableOptions.statuses}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-critical/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-textSecondary">Critical</p>
              <p className="text-2xl font-bold text-textPrimary">{counts.critical}</p>
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
              <p className="text-2xl font-bold text-textPrimary">{counts.high}</p>
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
              <p className="text-2xl font-bold text-textPrimary">{counts.medium}</p>
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
              <p className="text-2xl font-bold text-textPrimary">{counts.low}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">
            Vulnerabilities ({filteredVulns.length})
          </h2>
          {filteredVulns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-textSecondary">
                {searchTerm || Object.values(filters).some(f => f.length > 0) 
                  ? 'No vulnerabilities found matching your search and filters.' 
                  : 'No vulnerabilities found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVulns.map((vuln, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">{vuln.type}</p>
                    <p className="text-sm text-textSecondary">{vuln.file_path}:{vuln.line_number}</p>
                    <p className="text-sm text-textSecondary mt-1">{vuln.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-white text-xs rounded capitalize ${
                    vuln.severity === 'critical' ? 'bg-status-critical' :
                    vuln.severity === 'high' ? 'bg-status-high' :
                    vuln.severity === 'medium' ? 'bg-status-medium' :
                    'bg-status-low'
                  }`}>
                    {vuln.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities; 