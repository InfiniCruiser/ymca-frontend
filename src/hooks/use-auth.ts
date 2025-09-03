'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: string;
  programAreas?: string[];
  locations?: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - in a real app, this would check for a valid token
    const mockUser: User = {
      id: '1',
      email: 'john.doe@ymca.org',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: '1',
      role: 'PROGRAM_OWNER',
      programAreas: ['Child Protection', 'Governance'],
      locations: ['Main Branch'],
      isActive: true,
      lastLoginAt: new Date(),
    };

    // Simulate API call delay
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in a real app, this would make an API call
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      firstName: 'John',
      lastName: 'Doe',
      organizationId: '1',
      role: 'PROGRAM_OWNER',
      programAreas: ['Child Protection', 'Governance'],
      locations: ['Main Branch'],
      isActive: true,
      lastLoginAt: new Date(),
    };
    
    setUser(mockUser);
    setIsLoading(false);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
  };
}
