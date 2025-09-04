'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface TestAuth {
  organizationId: string;
  organizationName: string;
  isTestMode: boolean;
  testOrganization?: any;
  userName?: string;
  userEmail?: string;
}

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  testAuth: TestAuth | null;
  setTestAuth: (testAuth: TestAuth | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [testAuth, setTestAuth] = useState<TestAuth | null>(null);

  // Load test auth from localStorage on mount
  useEffect(() => {
    try {
      const savedTestAuth = localStorage.getItem('ymca_test_auth');
      if (savedTestAuth) {
        const parsedTestAuth = JSON.parse(savedTestAuth);
        setTestAuth(parsedTestAuth);
      }
    } catch (error) {
      console.error('Error loading test auth from localStorage:', error);
    }
  }, []);

  // Save test auth to localStorage whenever it changes
  useEffect(() => {
    if (testAuth) {
      try {
        localStorage.setItem('ymca_test_auth', JSON.stringify(testAuth));
      } catch (error) {
        console.error('Error saving test auth to localStorage:', error);
      }
    } else {
      try {
        localStorage.removeItem('ymca_test_auth');
      } catch (error) {
        console.error('Error removing test auth from localStorage:', error);
      }
    }
  }, [testAuth]);

  const contextValue = {
    ...auth,
    testAuth,
    setTestAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
