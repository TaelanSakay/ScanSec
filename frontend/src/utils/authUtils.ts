import apiClient from '../api';
import { User } from '../api';

// Token validation and user state management
export class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Initialize auth state
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isAuthenticated();
    }

    try {
      if (apiClient.isAuthenticated()) {
        const user = await apiClient.getCurrentUser();
        this.currentUser = user;
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearAuth();
    }

    this.isInitialized = true;
    return false;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Set current user
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Clear auth state
  clearAuth(): void {
    apiClient.logout();
    this.currentUser = null;
  }

  // Validate token and refresh user data
  async validateToken(): Promise<boolean> {
    try {
      if (!apiClient.isAuthenticated()) {
        return false;
      }

      const user = await apiClient.getCurrentUser();
      this.currentUser = user;
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearAuth();
      return false;
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Utility functions
export const requireAuth = (callback: () => void): void => {
  if (authManager.isAuthenticated()) {
    callback();
  } else {
    window.location.href = '/login';
  }
};

export const redirectIfAuthenticated = (): void => {
  if (authManager.isAuthenticated()) {
    window.location.href = '/dashboard';
  }
}; 