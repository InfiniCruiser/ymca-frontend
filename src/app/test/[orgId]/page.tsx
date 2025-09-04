'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context';

interface Organization {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  type: string;
  charterStatus: string;
  memberGroup: string;
  learningRegion: string;
  yStatus: string;
  yType: string;
  ceoName: string;
  settings: {
    timezone: string;
    autoFinalize: boolean;
    fiscalYearStart: string;
    allowEvidenceReuse: boolean;
    notificationSettings: {
      email: boolean;
      slack: boolean;
      reminders: {
        enabled: boolean;
        frequency: string;
        daysBeforeDue: number[];
      };
    };
    requireBoardApproval: boolean;
    defaultFrameworkVersion: string;
  };
}

interface TestPageProps {
  params: {
    orgId: string;
  };
}

export default function TestPage({ params }: TestPageProps) {
  const { orgId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTestAuth } = useAuthContext();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/organizations/${orgId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch organization: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.organization) {
          setOrganization(data.organization);
          
          // Extract user information from query parameters
          const userName = searchParams.get('name') || undefined;
          const userEmail = searchParams.get('email') || undefined;
          
          // Set test authentication context
          setTestAuth({
            organizationId: data.organization.id,
            organizationName: data.organization.name,
            isTestMode: true,
            testOrganization: data.organization,
            userName,
            userEmail
          });

          // Redirect to main dashboard after a brief delay to show the welcome message
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to load organization data');
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchOrganization();
    }
  }, [orgId, setTestAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Test Organization...</h2>
          <p className="text-gray-600">Setting up your test environment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold text-lg mb-2">Test Setup Failed</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (organization) {
    const userName = searchParams.get('name');
    const userEmail = searchParams.get('email');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold text-lg mb-2">✅ Test Mode Activated</h2>
            <p className="text-sm mb-2">
              <strong>{organization.name}</strong>
            </p>
            <p className="text-sm mb-2">
              {organization.city}, {organization.state}
            </p>
            {userName && (
              <p className="text-sm">
                <strong>Tester:</strong> {userName}
                {userEmail && ` (${userEmail})`}
              </p>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Redirecting to dashboard...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}

