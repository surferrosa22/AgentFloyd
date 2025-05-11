import { NextRequest } from 'next/server';
import { streamChatCompletion } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add system message if not present
    if (!messages.some(message => message.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'You are Floyd, a helpful AI assistant. You are friendly, empathetic, and knowledgeable. You always provide accurate and useful information. If you are unsure about something, you acknowledge this rather than making up information.',
      });
    }

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the streaming response
    streamChatCompletion(
      messages,
      // onChunk callback - send each chunk to the client
      async (chunk) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
      },
      // onComplete callback - close the stream
      async () => {
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        await writer.close();
      }
    ).catch(async (error) => {
      console.error('Streaming error:', error);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: 'An error occurred during streaming' })}\n\n`)
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
    console.error('Chat streaming API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 