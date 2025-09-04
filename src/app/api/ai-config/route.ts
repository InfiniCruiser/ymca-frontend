import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(request: NextRequest) {
  try {
    // Try to connect to backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/ai-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI configuration loaded from backend');
        return NextResponse.json({
          success: true,
          config: data.config,
          timestamp: new Date().toISOString()
        });
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using mock AI config:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Return mock AI config when backend is unavailable
    const mockConfig = {
      enabled: true,
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
      features: {
        analysis: true,
        recommendations: true,
        insights: true
      }
    };
    
    console.log('✅ AI configuration loaded from mock data');

    return NextResponse.json({
      success: true,
      config: mockConfig,
      timestamp: new Date().toISOString(),
      source: 'mock'
    });

  } catch (error) {
    console.error('❌ AI config error:', error);
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
