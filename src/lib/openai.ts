import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
});

export async function generateChatCompletion(messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
}

export async function enhancePrompt(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that enhances user prompts to make them more specific and detailed to get better AI responses. Keep the enhanced prompts concise but effective.',
        },
        {
          role: 'user',
          content: `Please enhance this prompt: "${prompt}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    return response.choices[0]?.message?.content || prompt;
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return prompt;
  }
}