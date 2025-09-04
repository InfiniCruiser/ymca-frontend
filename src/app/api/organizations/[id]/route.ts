import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/organizations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Organization data loaded from backend:', data.name);
        return NextResponse.json({
          success: true,
          organization: data,
          timestamp: new Date().toISOString(),
          source: 'backend'
        });
      } else {
        console.log('⚠️ Backend returned error, using mock data');
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using mock organization data:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Mock organization data as fallback
    const mockOrganization = {
      id: id,
      name: `Test YMCA Organization (${id.slice(0, 8)})`,
      city: 'Test City',
      state: 'TS',
      address: '123 Test Street',
      zipCode: '12345',
      phone: '555-123-4567',
      email: 'test@ymca.org',
      website: 'https://test.ymca.org',
      isActive: true,
      type: 'LOCAL_Y',
      charterStatus: 'Chartered',
      memberGroup: 'Test Group',
      learningRegion: 'Test Region',
      yStatus: 'Open',
      yType: 'Corporate Association',
      ceoName: 'Test CEO',
      settings: {
        timezone: 'America/New_York',
        autoFinalize: false,
        fiscalYearStart: '07-01',
        allowEvidenceReuse: true,
        notificationSettings: {
          email: true,
          slack: false,
          reminders: {
            enabled: true,
            frequency: 'weekly',
            daysBeforeDue: [7, 3, 1]
          }
        },
        requireBoardApproval: true,
        defaultFrameworkVersion: '1.0'
      }
    };

    console.log('✅ Organization data loaded from mock data');
    return NextResponse.json({
      success: true,
      organization: mockOrganization,
      timestamp: new Date().toISOString(),
      source: 'mock'
    });

  } catch (error) {
    console.error('❌ Organization API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch organization data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
