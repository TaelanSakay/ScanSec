import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

// Token storage key
const TOKEN_KEY = 'token';

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

// Auth types
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

// AI Recommendation types
export interface AIRecommendation {
  recommendation: string;
  fixed_code: string;
  explanation: string;
  best_practices: string[];
  ai_generated: boolean;
}

// API Client class for better organization and type safety
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          console.log('Authentication failed, removing token');
          this.removeAuthToken();
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management methods
  private getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Error message helper
  private getErrorMessage(error: any): string {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return data?.detail || 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in.';
        case 403:
          return 'Access denied. You do not have permission to perform this action.';
        case 404:
          return 'Resource not found. Please check the URL and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 504:
          return 'Request timed out. Please try again.';
        default:
          return data?.detail || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection and ensure the backend server is running.';
    } else {
      return error.message || 'An unexpected error occurred.';
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });
    
    this.setAuthToken(response.access_token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<User> {
    return await this.request<User>({
      method: 'POST',
      url: '/auth/signup',
      data: userData,
    });
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await this.request<User>({
      method: 'GET',
      url: '/auth/me',
    });
  }

  async updateUser(userData: UserUpdateRequest): Promise<User> {
    return await this.request<User>({
      method: 'PUT',
      url: '/auth/me',
      data: userData,
    });
  }

  logout(): void {
    this.removeAuthToken();
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  // Scan methods
  async fetchScanResults(repoUrl: string): Promise<ScanResult> {
    console.log('Fetching scan results for:', repoUrl);
    
    const response = await this.request<ScanResult>({
      method: 'POST',
      url: '/scan-repo',
      data: { repo_url: repoUrl },
    });
    
    console.log('API Response received:', response);
    
    // Flatten the vulnerabilities structure
    const vulnerabilities = this.flattenVulnerabilities(response);
    
    // Return the processed result
    return {
      repo_url: response.repo_url || repoUrl,
      scan_id: response.scan_id || `scan-${Date.now()}`,
      scan_timestamp: response.scan_timestamp || new Date().toISOString(),
      status: response.status || 'completed',
      summary: response.summary || {
        total_files_scanned: vulnerabilities.length,
        total_vulnerabilities: vulnerabilities.length,
        scan_duration_seconds: 0,
        scan_types_performed: [],
        language_breakdown: {},
      },
      vulnerabilities: vulnerabilities,
      metadata: response.metadata || {},
    };
  }

  // Helper function to flatten nested vulnerabilities structure
  private flattenVulnerabilities(data: any): Vulnerability[] {
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
                  file_path: vuln.file_path || filePath,
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

  // Export functions
  async exportReport(scanData: any, format: 'json' | 'csv' = 'json'): Promise<any> {
    const response = await this.request<any>({
      method: 'POST',
      url: '/scan/export-report',
      data: {
        scan_data: scanData,
        format: format,
      },
    });
    
    if (format === 'csv') {
      // Handle CSV download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      return { success: true };
    }
    
    return response;
  }

  // Health check
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Scan History methods
  async getScanHistory(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await this.request<{ history: any[] }>({
      method: 'GET',
      url: `/scan/history?limit=${limit}&offset=${offset}`,
    });
  
    return response.history || []; // ✅ Always return array
  }
  

  async getScanDetails(scanId: number): Promise<any> {
    return await this.request<any>({
      method: 'GET',
      url: `/scan/history/${scanId}`,
    });
  }

  // AI Recommendation methods
  async getAIRecommendation(vulnerabilityData: any): Promise<{ available: boolean; recommendation?: AIRecommendation; message?: string }> {
    return await this.request<any>({
      method: 'POST',
      url: '/scan/recommendation',
      data: vulnerabilityData,
    });
  }

  async getAIStatus(): Promise<{ available: boolean; message: string }> {
    return await this.request<any>({
      method: 'GET',
      url: '/scan/ai-status',
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

// Export the singleton instance
export default apiClient; 