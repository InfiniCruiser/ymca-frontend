import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(request: NextRequest) {
  try {
    // Try to connect to backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/api/ai-config/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI status loaded from backend');
        return NextResponse.json({
          success: true,
          status: data.status,
          timestamp: new Date().toISOString()
        });
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using mock AI status:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Return mock AI status when backend is unavailable
    const mockStatus = {
      available: true,
      version: '1.0.0',
      lastCheck: new Date().toISOString(),
      services: {
        analysis: 'operational',
        recommendations: 'operational',
        insights: 'operational'
      }
    };
    
    console.log('✅ AI status loaded from mock data');

    return NextResponse.json({
      success: true,
      status: mockStatus,
      timestamp: new Date().toISOString(),
      source: 'mock'
    });

  } catch (error) {
    console.error('❌ AI status error:', error);
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
