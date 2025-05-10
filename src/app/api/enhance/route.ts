import { NextRequest, NextResponse } from 'next/server';
import { enhancePrompt } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt string is required' },
        { status: 400 }
      );
    }

    const enhancedPrompt = await enhancePrompt(prompt);

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error('Enhance API error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}