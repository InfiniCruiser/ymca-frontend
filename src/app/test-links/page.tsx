'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth-context';

interface Organization {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
}

export default function TestLinksPage() {
  const { testAuth, setTestAuth } = useAuthContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Set base URL based on environment
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await fetch('https://ymca-backend-c1a73b2f2522.herokuapp.com/api/v1/organizations', {
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Filter to only active organizations and limit to first 20 for easier selection
            const activeOrgs = data
              .filter((org: any) => org.isActive)
              .slice(0, 20)
              .map((org: any) => ({
                id: org.id,
                name: org.name,
                city: org.city,
                state: org.state,
                isActive: org.isActive
              }));

            setOrganizations(activeOrgs);
            return;
          }
        } catch (backendError) {
          console.log('⚠️ Backend unavailable, using mock organizations:', backendError instanceof Error ? backendError.message : 'Unknown error');
        }

        // Mock organizations as fallback
        const mockOrganizations = [
          { id: '0c7e6cbd-d604-40de-bfbb-711e70ad0d14', name: 'Alexandria Area YMCA', city: 'Alexandria', state: 'MN', isActive: true },
          { id: '56185def-d032-424c-a3e6-d346398597b5', name: 'Ann Arbor YMCA', city: 'Ann Arbor', state: 'MI', isActive: true },
          { id: 'f24f4407-1886-463b-a4d3-884ee0275c69', name: 'Ashtabula County Family YMCA', city: 'Ashtabula', state: 'OH', isActive: true },
          { id: '2a142b94-74bd-44ea-b2da-5e0f0f831b76', name: 'Athens-McMinn Family YMCA', city: 'Athens', state: 'TN', isActive: true },
          { id: '17585841-7fa4-4ab9-b1e0-1d359d1572f9', name: 'Barren County Family YMCA', city: 'Glasgow', state: 'KY', isActive: true },
          { id: '05f48f6a-9417-41fe-b2cd-1eb0eedbdec1', name: 'YMCA of Greater Long Beach', city: 'Long Beach', state: 'CA', isActive: true },
          { id: 'e988ead3-046b-46ec-b99e-8f54d1516fbf', name: 'YMCA of Greater Des Moines Iowa', city: 'Des Moines', state: 'IA', isActive: true },
          { id: '661806ec-18dc-4f51-aa2b-e83be158952d', name: 'YMCA of Greater Erie', city: 'Erie', state: 'PA', isActive: true },
          { id: 'b6f0d000-f36a-4d18-a290-9bbd15deb39d', name: 'YMCA of Greater Grand Rapids', city: 'Grand Rapids', state: 'MI', isActive: true },
          { id: 'f08738a1-c796-4e21-bd72-d685851a69ac', name: 'YMCA of Greater Indianapolis', city: 'Indianapolis', state: 'IN', isActive: true },
          { id: '85c5bad7-9cbe-4121-a7e5-0f5fb1056f59', name: 'YMCA of Greater Montgomery', city: 'Montgomery', state: 'AL', isActive: true },
          { id: 'bca55896-67b6-4eb8-9082-e926634f053f', name: 'YMCA of Greater Nashua', city: 'Nashua', state: 'NH', isActive: true },
          { id: '1fde15d4-e6b8-482a-b800-9b251f7eff53', name: 'YMCA of Greater Pittsburgh', city: 'Pittsburgh', state: 'PA', isActive: true },
          { id: '38b4b13b-ecad-478a-ab32-b82f9a939c17', name: 'YMCA of Greater Waukesha County', city: 'New Berlin', state: 'WI', isActive: true },
          { id: '6e0d9bea-9216-4a58-b329-058d040b2d89', name: 'YMCA of Greenville', city: 'Greenville', state: 'SC', isActive: true },
          { id: '8ea668fc-8301-428d-80e9-dc4e2acc26eb', name: 'YMCA of Hannibal', city: 'Hannibal', state: 'MO', isActive: true },
          { id: 'ef55f6c1-b998-4e5b-b58e-cca300d5f3de', name: 'YMCA of La Porte Indiana', city: 'La Porte', state: 'IN', isActive: true },
          { id: '5abbbeb2-de78-4550-a9bd-023c85ba924b', name: 'YMCA of Mankato', city: 'Mankato', state: 'MN', isActive: true },
          { id: 'dbdc7bdf-5729-45cd-95d3-586bd3ca7c0b', name: 'YMCA of Metropolitan Huntsville AL', city: 'Madison', state: 'AL', isActive: true },
          { id: '778f4620-7b02-4f09-8b51-a3159ac7d100', name: 'YMCA of Newton Iowa Inc.', city: 'Newton', state: 'IA', isActive: true }
        ];

        setOrganizations(mockOrganizations);
        console.log('✅ Organizations loaded from mock data');
        
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleOrgToggle = (orgId: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOrgs(organizations.map(org => org.id));
  };

  const handleSelectNone = () => {
    setSelectedOrgs([]);
  };

  const generateTestLinks = () => {
    return selectedOrgs.map(orgId => {
      const org = organizations.find(o => o.id === orgId);
      return {
        orgId,
        name: org?.name || 'Unknown Organization',
        city: org?.city || '',
        state: org?.state || '',
        url: `${baseUrl}/test/${orgId}`
      };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllLinks = () => {
    const links = generateTestLinks();
    const linkText = links.map(link => `${link.name} (${link.city}, ${link.state}): ${link.url}`).join('\n');
    copyToClipboard(linkText);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Organizations...</h2>
          <p className="text-gray-600">Fetching YMCA organizations for test links</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold text-lg mb-2">Failed to Load Organizations</h2>
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

  const testLinks = generateTestLinks();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">YMCA Test Links Generator</h1>
            <p className="text-gray-600 mt-2">
              Generate personalized test links for YMCA organizations. Testers will be automatically logged in as the selected organization.
            </p>
          </div>

          <div className="p-6">
            {/* Current Test Mode Status */}
            {testAuth && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current Test Mode</h3>
                <p className="text-blue-800">
                  <strong>{testAuth.organizationName}</strong> (ID: {testAuth.organizationId})
                </p>
                <button
                  onClick={() => setTestAuth(null)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Exit Test Mode
                </button>
              </div>
            )}

            {/* Organization Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select Organizations</h2>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Select None
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {organizations.map((org) => (
                  <label
                    key={org.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrgs.includes(org.id)}
                      onChange={() => handleOrgToggle(org.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {org.city}, {org.state}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generated Test Links */}
            {testLinks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Generated Test Links ({testLinks.length})
                  </h2>
                  <button
                    onClick={copyAllLinks}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Copy All Links
                  </button>
                </div>

                <div className="space-y-3">
                  {testLinks.map((link) => (
                    <div
                      key={link.orgId}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {link.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {link.city}, {link.state}
                        </p>
                        <p className="text-xs text-blue-600 font-mono truncate mt-1">
                          {link.url}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="ml-4 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">How to Use Test Links</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Share test links with testers via email, Slack, or other communication tools</li>
                <li>• When testers click a link, they'll be automatically logged in as that organization</li>
                <li>• Testers can complete surveys and submit data for the assigned organization</li>
                <li>• All test data will be associated with the organization's ID for easy tracking</li>
                <li>• Test mode is clearly indicated in the interface to avoid confusion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
