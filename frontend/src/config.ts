// Configuration for the application
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://your-render-backend-url.onrender.com' 
      : 'http://localhost:8000'),
  
  // Development settings
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Feature flags
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true',
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
} as const;

export default config; 