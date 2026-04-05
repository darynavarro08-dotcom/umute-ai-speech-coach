import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Forward to Python backend
    const backendFormData = new FormData();
    backendFormData.append('audio', audio);

    const response = await fetch('http://localhost:8000/api/transcribe', {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      throw new Error('Backend transcription failed');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
