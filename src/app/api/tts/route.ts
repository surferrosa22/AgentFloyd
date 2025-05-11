import { NextRequest } from 'next/server';
import { textToSpeech, setElevenLabsApiKey } from '@/lib/elevenlabs';

// Set the API key from environment variables
if (process.env.ELEVENLABS_API_KEY) {
  setElevenLabsApiKey(process.env.ELEVENLABS_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, options } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Make sure we have an API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key is not configured. Please add ELEVENLABS_API_KEY to your environment variables.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get audio blob from ElevenLabs
    const audioBlob = await textToSpeech(text, voiceId, options);
    
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Return the audio data
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to convert text to speech';
      
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 