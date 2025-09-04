import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { submissionId } = params;
    
    // Fetch performance calculation by submission ID from backend
    const response = await fetch(`${BACKEND_URL}/api/v1/performance-calculations/submission/${submissionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend performance calculation fetch error:', response.status, errorText);
      throw new Error(`Backend performance calculation fetch error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Performance calculation fetched successfully for submission:', submissionId);

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
