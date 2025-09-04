import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/submissions/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend submission fetch error:', response.status, errorText);
      throw new Error(`Backend submission fetch error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Submission fetched successfully');

    return NextResponse.json({
      success: true,
      submission: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submission fetch error:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/submissions/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend submission update error:', response.status, errorText);
      throw new Error(`Backend submission update error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Submission updated successfully');

    return NextResponse.json({
      success: true,
      submission: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submission update error:', error);
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
