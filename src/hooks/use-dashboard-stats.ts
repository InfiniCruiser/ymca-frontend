'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  activePeriods: number;
  overdueResponses: number;
  pendingReviews: number;
  complianceScore: number;
  totalSubmissions: number;
  completedSubmissions: number;
  organizationId: string;
  lastUpdated: string;
}

export function useDashboardStats(organizationId?: string) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!organizationId) {
        setError('Organization ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/v1/submissions/dashboard-stats?organizationId=${organizationId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        setData(stats);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
        
        // Fallback to mock data if API fails
        const mockStats: DashboardStats = {
          activePeriods: 3,
          overdueResponses: 5,
          pendingReviews: 8,
          complianceScore: 87,
          totalSubmissions: 12,
          completedSubmissions: 10,
          organizationId: organizationId || 'mock',
          lastUpdated: new Date().toISOString(),
        };
        setData(mockStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  return { data, isLoading, error };
}
