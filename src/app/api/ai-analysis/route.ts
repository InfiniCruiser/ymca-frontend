import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt || !prompt.system || !prompt.user) {
      return NextResponse.json(
        {
          error: 'Invalid prompt format. Expected {system, user}',
          received: prompt
        },
        { status: 400 }
      );
    }

    console.log('🚀 Processing AI analysis request for:', context?.ymcaName || 'Unknown YMCA');

    // Call the backend AI analysis endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/ai-config/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend AI analysis error:', response.status, errorText);
      throw new Error(`Backend AI analysis error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ AI analysis completed successfully');

    return NextResponse.json({
      success: true,
      content: data.content,
      usage: data.usage,
      model: data.model,
      source: 'azure-openai',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI analysis error:', error);
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
