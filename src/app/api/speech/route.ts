import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/speech-to-text';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check if the request content type is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Transcribe the audio
    const result = await transcribeAudio(audioFile);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Return the transcription
    return NextResponse.json({ 
      success: true,
      text: result.text 
    });
  } catch (error) {
    console.error('Speech API error:', error);
    return NextResponse.json(
      { error: 'Failed to process speech request' },
      { status: 500 }
    );
  }
}