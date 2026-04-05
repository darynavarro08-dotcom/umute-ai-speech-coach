import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to Python backend
    const response = await fetch('http://localhost:8000/api/generate-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Backend feedback generation failed');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: 'Feedback generation failed' },
      { status: 500 }
    );
  }
}
