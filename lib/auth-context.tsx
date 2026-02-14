'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, storeTokens, clearTokens, getAccessToken } from './api';

interface User {
  id: number;
  email: string;
  full_name: string;
  organization_id: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, organizationName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        const response = await auth.me();
        if (!response.error && response.data) {
          setUser(response.data as User);
        } else {
          clearTokens();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await auth.login(email, password);
    if (response.error) {
      throw new Error(response.error);
    }
    if (response.data) {
      storeTokens(response.data);
      // Fetch user info
      const userResponse = await auth.me();
      if (!userResponse.error) {
        setUser(userResponse.data as User);
      }
    }
  };

  const register = async (email: string, password: string, fullName: string, organizationName: string) => {
    const response = await auth.register(email, password, fullName, organizationName);
    if (response.error) {
      throw new Error(response.error);
    }
    if (response.data) {
      storeTokens(response.data);
      // Fetch user info
      const userResponse = await auth.me();
      if (!userResponse.error) {
        setUser(userResponse.data as User);
      }
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
