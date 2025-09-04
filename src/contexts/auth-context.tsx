'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface TestAuth {
  organizationId: string;
  organizationName: string;
  isTestMode: boolean;
  testOrganization?: any;
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
