import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
});

// Define get_time tool for function calling
const getTimeTool = {
  name: 'get_time',
  description: 'Returns the current local time as HH:mm string.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};

export async function generateChatCompletion(messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>) {
  try {
    // Allow tool calling with get_time
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      functions: [getTimeTool],
      function_call: 'auto',
    });
    const message = response.choices[0]?.message;
    // If model requests a tool call, execute and resume
    if (message?.function_call) {
      const { name } = message.function_call;
      let toolResult = '';
      if (name === 'get_time') {
        toolResult = getTimeTool.execute();
      }
      // Append tool response and get final assistant reply
      const followUp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...messages,
          message,
          { role: 'function', name, content: toolResult }
        ]
      });
      return {
        content: followUp.choices[0]?.message?.content || '',
        usage: followUp.usage || response.usage
      };
    }

    // No tool call, return as-is
    return {
      content: message?.content || '',
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