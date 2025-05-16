import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Get the form data with the image
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Convert buffer to base64
    const base64Image = buffer.toString('base64');

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that describes screen contents concisely. Focus on the main elements visible, any text that might be important, and the general layout. Keep descriptions brief but informative.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What do you see in this screen capture? Describe it briefly.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    // Extract the description
    const description = response.choices[0]?.message?.content || 'Unable to analyze the image.';

    // Return the description
    return NextResponse.json({ description });
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

// Configure the API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 