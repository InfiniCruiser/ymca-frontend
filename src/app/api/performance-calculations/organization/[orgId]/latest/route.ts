import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { orgId } = params;
    console.log(`Attempting to fetch latest performance calculation for organization: ${orgId}`);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/performance-calculations/organization/${orgId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend performance calculation fetch error:', response.status, errorText);
      throw new Error(`Backend performance calculation fetch error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Organization API response data:', JSON.stringify(data, null, 2));
    console.log('📊 Organization API response type:', typeof data);
    console.log('📊 Organization API response keys:', data ? Object.keys(data) : 'No data');
    console.log('✅ Latest performance calculation fetched successfully for organization:', orgId);
    
    return NextResponse.json({
      success: true,
      performanceCalculation: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Performance calculation fetch error:', error);
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
