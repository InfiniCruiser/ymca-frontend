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

    // Check if response has content before trying to parse JSON
    const responseText = await response.text();
    console.log('📊 Backend response text:', responseText);
    console.log('📊 Backend response length:', responseText.length);
    
    if (!responseText || responseText.trim() === '') {
      console.log('⚠️ Backend returned empty response for submission:', submissionId);
      return NextResponse.json({
        success: false,
        error: 'No performance calculation data found for this submission',
        submissionId: submissionId,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse backend response as JSON:', parseError);
      console.error('❌ Raw response:', responseText);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response from backend',
        rawResponse: responseText,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('📊 Backend response data:', data);
    console.log('📊 Backend response type:', typeof data);
    console.log('📊 Backend response keys:', data ? Object.keys(data) : 'No data');
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
