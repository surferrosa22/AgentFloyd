import { NextRequest } from 'next/server';
import { streamTextToSpeech, setElevenLabsApiKey } from '@/lib/elevenlabs';

// Set the API key from environment variables
if (process.env.ELEVENLABS_API_KEY) {
  setElevenLabsApiKey(process.env.ELEVENLABS_API_KEY);
}

export const dynamic = 'force-dynamic';

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

    // Create a stream for the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the streaming process
    streamTextToSpeech(
      text,
      // onChunk callback - send each audio chunk to the client
      async (audioChunk) => {
        const audioBuffer = await audioChunk.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        await writer.write(encoder.encode(`data: ${JSON.stringify({ audio: base64Audio })}\n\n`));
      },
      // onFinish callback - close the stream
      async () => {
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        await writer.close();
      },
      voiceId, 
      options
    ).catch(async (error) => {
      console.error('TTS Streaming error:', error);
      
      // Send the specific error message to the client
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during streaming';
      
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
      );
      await writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('TTS Streaming API error:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to stream text to speech';
      
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 