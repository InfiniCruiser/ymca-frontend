import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Try to connect to backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/submissions/dashboard-stats?organizationId=${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats loaded from backend');
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using mock data:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Return mock data when backend is unavailable
    const mockData = {
      activePeriods: 3,
      overdueResponses: 1,
      pendingReviews: 2,
      complianceScore: 85,
      organizationId: organizationId,
      lastUpdated: new Date().toISOString(),
      success: true,
      source: 'mock'
    };
    
    console.log('✅ Dashboard stats loaded from mock data');

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
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
