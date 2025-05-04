import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

// Define types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_at: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGithub: () => void;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - will be replaced with actual API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // Load user and tokens from localStorage on initial load
  useEffect(() => {
    if (isBrowser) {
      const storedUser = localStorage.getItem('meverse_user');
      const storedTokens = localStorage.getItem('meverse_tokens');
      
      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      }
      
      setIsLoading(false);
    }
  }, [isBrowser]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const tokenData = await response.json();
      setTokens(tokenData);
      
      if (isBrowser) {
        localStorage.setItem('meverse_tokens', JSON.stringify(tokenData));
      }
      
      // Fetch user profile
      await fetchUserProfile(tokenData.access_token);
      
      // Redirect to dashboard after login
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub login function
  const loginWithGithub = () => {
    if (isBrowser) {
      // Redirect to GitHub OAuth endpoint
      window.location.href = `${API_URL}/auth/github/login`;
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      const user = await response.json();
      
      // Auto-login after registration
      await login(userData.username, userData.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setTokens(null);
    
    if (isBrowser) {
      localStorage.removeItem('meverse_user');
      localStorage.removeItem('meverse_tokens');
    }
    
    router.push('/login');
  };

  // Fetch user profile
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      if (isBrowser) {
        localStorage.setItem('meverse_user', JSON.stringify(userData));
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Refresh token
  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refresh_token) return false;
    
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const newTokenData = await response.json();
      
      // Update tokens, preserving the refresh_token from the response
      const updatedTokens = {
        ...newTokenData,
        refresh_token: newTokenData.refresh_token || tokens.refresh_token,
      };
      
      setTokens(updatedTokens);
      
      if (isBrowser) {
        localStorage.setItem('meverse_tokens', JSON.stringify(updatedTokens));
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // On refresh failure, log the user out
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGithub,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 