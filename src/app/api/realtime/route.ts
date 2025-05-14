import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('Received request for Realtime API session');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }
    
    const { model, voice } = await req.json();
    console.log('Request parameters:', { model, voice });
    
    // Use official OpenAI SDK to create Realtime session (handles headers, retries, etc.)
    console.log('Creating realtime session via OpenAI SDK');
    const session = await openai.beta.realtime.sessions.create({
      model: model || 'gpt-4o-realtime-preview',
      voice: voice || 'alloy',
    });

    console.log('Successfully created session');
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating realtime session:', error);
    return NextResponse.json(
      { error: 'Failed to create realtime session', details: String(error) },
      { status: 500 }
    );
  }
} 