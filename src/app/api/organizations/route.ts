import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(request: NextRequest) {
  try {
    // Try to connect to backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/organizations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Organizations loaded from backend');
        return NextResponse.json({
          success: true,
          organizations: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using mock organizations:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Return mock organizations when backend is unavailable
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

    console.log('✅ Organizations loaded from fallback (mock)');
    return NextResponse.json({
      success: true,
      organizations: mockOrganizations,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    });

  } catch (error) {
    console.error('❌ Organizations error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
