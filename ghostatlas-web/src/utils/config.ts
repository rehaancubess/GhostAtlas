// Environment configuration
export const config = {
  // In development, use Vite proxy to avoid CORS issues
  // In production, use the full AWS API Gateway URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV 
      ? '/api'  // Use Vite proxy in development
      : 'https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api'),
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
} as const;

// Validate required environment variables
export function validateConfig(): void {
  if (!config.googleMapsApiKey) {
    console.warn('VITE_GOOGLE_MAPS_API_KEY is not set. Map features will not work.');
  }
}
