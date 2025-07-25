import axios from 'axios';
import config from './config';

// Configure axios to use the FastAPI backend
axios.defaults.baseURL = config.API_BASE_URL;
axios.defaults.timeout = config.API_TIMEOUT;

// Add request interceptor for logging in development
if (config.IS_DEVELOPMENT) {
  axios.interceptors.request.use(request => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });
}

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// TypeScript types matching backend
export interface Vulnerability {
  type: string;
  severity: string;
  file_path: string;
  line_number: number;
  description: string;
  code_snippet: string;
  recommendation?: string;
  language?: string;
}

export interface ScanSummary {
  total_files_scanned: number;
  total_vulnerabilities: number;
  scan_duration_seconds: number;
  scan_types_performed: string[];
  language_breakdown: Record<string, number>;
}

export interface ScanMetadata {
  start_time: string;
  end_time: string;
  duration_seconds: number;
}

export interface ScanResult {
  repo_url: string;
  scan_id?: string;
  scan_timestamp?: string;
  status?: string;
  summary?: ScanSummary;
  vulnerabilities: Vulnerability[];
  metadata?: Record<string, any>;
  scan_metadata?: ScanMetadata;
}

// Helper function to flatten nested vulnerabilities structure
function flattenVulnerabilities(data: any): Vulnerability[] {
  console.log('Raw API response:', data);
  
  // If vulnerabilities is already an array, return it
  if (Array.isArray(data.vulnerabilities)) {
    console.log('Vulnerabilities is already an array:', data.vulnerabilities);
    return data.vulnerabilities;
  }
  
  // If vulnerabilities is an object with language keys, flatten it
  if (data.vulnerabilities && typeof data.vulnerabilities === 'object') {
    const flattened: Vulnerability[] = [];
    
    Object.entries(data.vulnerabilities).forEach(([language, files]: [string, any]) => {
      if (typeof files === 'object') {
        Object.entries(files).forEach(([filePath, vulns]: [string, any]) => {
          if (Array.isArray(vulns)) {
            vulns.forEach((vuln: any) => {
              flattened.push({
                ...vuln,
                language: vuln.language || language,
                file_path: vuln.file_path || filePath
              });
            });
          }
        });
      }
    });
    
    console.log('Flattened vulnerabilities:', flattened);
    return flattened;
  }
  
  // Fallback to empty array
  console.log('No vulnerabilities found, using empty array');
  return [];
}

// Error handling helper
function getErrorMessage(error: any): string {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.detail || 'Invalid request. Please check the repository URL.';
      case 404:
        return 'Repository not found. Please check the URL and ensure it\'s a public GitHub repository.';
      case 500:
        return 'Server error. Please try again later.';
      case 504:
        return 'Request timed out. The repository might be too large or the server is busy.';
      default:
        return data?.detail || `Server error (${status}). Please try again.`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and ensure the backend server is running.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
}

export async function fetchScanResults(repoUrl: string): Promise<ScanResult> {
  try {
    console.log('Fetching scan results for:', repoUrl);
    const response = await axios.post('/scan-repo', { repo_url: repoUrl });
    
    console.log('API Response received:', response.data);
    
    // Flatten the vulnerabilities structure
    const vulnerabilities = flattenVulnerabilities(response.data);
    
    // Return the processed result
    return {
      repo_url: response.data.repo_url || repoUrl,
      scan_id: response.data.scan_id || `scan-${Date.now()}`,
      scan_timestamp: response.data.scan_timestamp || new Date().toISOString(),
      status: response.data.status || 'completed',
      summary: response.data.summary || {
        total_files_scanned: vulnerabilities.length,
        total_vulnerabilities: vulnerabilities.length,
        scan_duration_seconds: 0,
        scan_types_performed: [],
        language_breakdown: {}
      },
      vulnerabilities: vulnerabilities,
      metadata: response.data.metadata || {}
    };
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    console.error('Scan failed:', errorMessage);
    throw new Error(errorMessage);
  }
}

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await axios.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
} 