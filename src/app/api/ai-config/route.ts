import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Call the backend AI config endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/ai-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend AI config error:', response.status, errorText);
      throw new Error(`Backend AI config error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ AI configuration loaded successfully');

    return NextResponse.json({
      success: true,
      config: data.config,
      timestamp: new Date().toISOString()
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
