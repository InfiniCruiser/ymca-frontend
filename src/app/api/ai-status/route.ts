import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Call the backend AI status endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/api/ai-config/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend AI status error:', response.status, errorText);
      throw new Error(`Backend AI status error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ AI status loaded successfully');

    return NextResponse.json({
      success: true,
      status: data.status,
      timestamp: new Date().toISOString()
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
