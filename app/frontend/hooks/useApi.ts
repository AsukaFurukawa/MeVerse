import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Custom hook for making authenticated API requests
export const useApi = () => {
  const { tokens, refreshToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to make authenticated requests with token refresh capability
  const authFetch = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        // Add auth header if we have a token
        const headers = new Headers(options.headers || {});
        
        if (tokens?.access_token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${tokens.access_token}`);
        }

        // Merge headers with options
        const requestOptions: RequestInit = {
          ...options,
          headers,
        };

        // Execute the request
        let response = await fetch(`${API_URL}${endpoint}`, requestOptions);

        // Handle 401 Unauthorized error - attempt token refresh
        if (response.status === 401) {
          // Try to refresh the token
          const refreshSuccess = await refreshToken();

          if (refreshSuccess && tokens?.access_token) {
            // Update the auth header with the new token
            headers.set('Authorization', `Bearer ${tokens.access_token}`);
            
            // Retry the request with the new token
            response = await fetch(`${API_URL}${endpoint}`, {
              ...requestOptions,
              headers,
            });
          } else {
            // If refresh failed, throw an error
            throw new Error('Authentication expired. Please log in again.');
          }
        }

        // Handle API errors
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || 'An error occurred with the API request'
          );
        }

        // Parse the JSON response
        const data = await response.json();
        return data as T;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tokens, refreshToken]
  );

  return {
    authFetch,
    loading,
    error,
    setError,
  };
}; 