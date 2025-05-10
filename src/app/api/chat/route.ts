import { NextRequest, NextResponse } from 'next/server';
import { generateChatCompletion } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system message if not present
    if (!messages.some(message => message.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'You are Floyd, a helpful AI assistant. You are friendly, empathetic, and knowledgeable. You always provide accurate and useful information. If you are unsure about something, you acknowledge this rather than making up information.',
      });
    }

    const response = await generateChatCompletion(messages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}