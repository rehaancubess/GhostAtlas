import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/utils/config';

// Error response type from backend
interface ApiErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// Exponential backoff configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [500, 503],
};

// Calculate exponential backoff delay
function getRetryDelay(retryCount: number): number {
  const delay = RETRY_CONFIG.initialDelayMs * Math.pow(2, retryCount);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

// Check if error is retryable
function isRetryableError(error: AxiosError): boolean {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const status = error.response.status;
  return RETRY_CONFIG.retryableStatusCodes.includes(status);
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable CORS credentials if needed
  withCredentials: false,
});

// Request interceptor for logging and headers
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        baseURL: config.baseURL,
      });
    }

    // Don't add custom headers that aren't in CORS allowed list
    // The API Gateway CORS config allows:
    // Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and data transformation
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        corsHeaders: {
          'access-control-allow-origin': response.headers['access-control-allow-origin'],
          'access-control-allow-methods': response.headers['access-control-allow-methods'],
        }
      });
    }

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    // Check if it's a CORS error
    if (!error.response && error.message.includes('Network Error')) {
      console.error('[CORS Error] Request blocked by CORS policy', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'This is likely a CORS issue. Check that the API Gateway has CORS enabled.',
      });
    }

    // Log error
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.response?.data,
      message: error.message,
    });

    // Handle retry logic
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0;

    // Check if we should retry
    if (config._retryCount < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
      config._retryCount += 1;
      
      const delay = getRetryDelay(config._retryCount - 1);
      
      console.log(
        `[API Retry] Attempt ${config._retryCount}/${RETRY_CONFIG.maxRetries} after ${delay}ms`,
        { url: config.url }
      );

      await sleep(delay);
      
      return apiClient.request(config);
    }

    // Transform error for better handling
    const transformedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errorCode: error.response?.data?.errorCode || 'UNKNOWN_ERROR',
      status: error.response?.status,
      requestId: error.response?.data?.requestId,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };

    return Promise.reject(transformedError);
  }
);

export default apiClient;
