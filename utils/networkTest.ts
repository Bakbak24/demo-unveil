import { API_CONFIG } from '../config/api';

export interface NetworkTestResult {
  success: boolean;
  message: string;
  details?: any;
  url?: string;
  status?: number;
}

/**
 * Test basic connectivity to the backend server
 */
export const testBackendConnection = async (): Promise<NetworkTestResult> => {
  try {
    console.log('Testing connection to:', API_CONFIG.BASE_URL);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Successfully connected to backend',
        details: data,
        url: API_CONFIG.BASE_URL,
        status: response.status,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `Backend responded with error: ${response.status}`,
        details: errorText,
        url: API_CONFIG.BASE_URL,
        status: response.status,
      };
    }
  } catch (error) {
    console.error('Network test error:', error);
    
    let message = 'Unknown network error';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Connection timeout - server took too long to respond';
      } else if (error.message === 'Network request failed') {
        message = 'Network request failed - unable to reach server';
      } else if (error.message?.includes('fetch')) {
        message = 'Fetch error - connection problem';
      } else {
        message = error.message;
      }
    }

    return {
      success: false,
      message,
      details: error,
      url: API_CONFIG.BASE_URL,
    };
  }
};

/**
 * Test authentication with a token
 */
export const testAuthenticatedConnection = async (token: string): Promise<NetworkTestResult> => {
  try {
    console.log('Testing authenticated connection to:', API_CONFIG.BASE_URL);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    console.log('Auth response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Successfully authenticated with backend',
        details: data,
        url: API_CONFIG.BASE_URL,
        status: response.status,
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: 'Authentication failed - token is invalid or expired',
        url: API_CONFIG.BASE_URL,
        status: response.status,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `Backend responded with error: ${response.status}`,
        details: errorText,
        url: API_CONFIG.BASE_URL,
        status: response.status,
      };
    }
  } catch (error) {
    console.error('Auth test error:', error);
    
    let message = 'Unknown authentication error';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Authentication timeout';
      } else if (error.message === 'Network request failed') {
        message = 'Network request failed during authentication';
      } else {
        message = error.message;
      }
    }

    return {
      success: false,
      message,
      details: error,
      url: API_CONFIG.BASE_URL,
    };
  }
};

/**
 * Get network diagnostic information
 */
export const getNetworkDiagnostics = () => {
  return {
    apiConfig: API_CONFIG.DEBUG_INFO,
    baseUrl: API_CONFIG.BASE_URL,
    timestamp: new Date().toISOString(),
    userAgent: navigator?.userAgent || 'Unknown',
  };
}; 