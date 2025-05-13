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
    
    // Make a direct request to the OpenAI API
    console.log('Making request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify({
        model: model || "gpt-4o-realtime-preview",
        voice: voice || "alloy",
      }),
    });

    const responseBody = await response.text();
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      console.error('OpenAI API error:', response.status, responseBody);
      return NextResponse.json(
        { 
          error: `OpenAI API responded with status ${response.status}`,
          details: responseBody
        },
        { status: response.status }
      );
    }

    try {
      const session = JSON.parse(responseBody);
      console.log('Successfully created session');
      return NextResponse.json(session);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse API response',
          raw: responseBody
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating realtime session:', error);
    return NextResponse.json(
      { error: 'Failed to create realtime session', details: String(error) },
      { status: 500 }
    );
  }
} 