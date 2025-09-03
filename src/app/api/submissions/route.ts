import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend submissions error:', response.status, errorText);
      throw new Error(`Backend submissions error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Submissions loaded successfully');

    return NextResponse.json({
      success: true,
      submissions: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submissions error:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend submission creation error:', response.status, errorText);
      throw new Error(`Backend submission creation error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Submission created successfully');

    return NextResponse.json({
      success: true,
      submission: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submission creation error:', error);
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
