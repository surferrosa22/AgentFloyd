import axios from 'axios';

// ElevenLabs API constants
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'dPah2VEoifKnZT37774q'; // Custom voice ID
const DEFAULT_MODEL = 'elevenmultilingual_v2'; // Multilingual model

// Global API key - should be set via environment variables in a real application
let apiKey = process.env.ELEVENLABS_API_KEY || '';

/**
 * Set the ElevenLabs API key to use for requests
 */
export function setElevenLabsApiKey(key: string) {
  apiKey = key;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getVoices() {
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    return response.data.voices;
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    throw error;
  }
}

/**
 * Convert text to speech using ElevenLabs API
 * Returns audio as Blob
 */
export async function textToSpeech(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  options: {
    stability?: number;
    similarityBoost?: number;
    model?: string;
  } = {}
) {
  try {
    if (!apiKey) {
      throw new Error('ElevenLabs API key not set. Please add your key in the environment variables as ELEVENLABS_API_KEY.');
    }
    
    const { stability = 0.5, similarityBoost = 0.75, model = DEFAULT_MODEL } = options;
    
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'blob',
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error converting text to speech with ElevenLabs:', error);
    
    // Add more specific error messages based on the error type
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('ElevenLabs API key is invalid or expired');
      } 
      if (error.response?.status === 429) {
        throw new Error('ElevenLabs API rate limit exceeded. Please try again later.');
      } 
      if (error.response) {
        throw new Error(`ElevenLabs API error: ${error.response.status} ${error.response.statusText}`);
      } 
      if (error.request) {
        throw new Error('Network error. Could not connect to ElevenLabs API.');
      }
    }
    
    // Re-throw the original error with more context
    throw error;
  }
}

/**
 * Stream text to speech using ElevenLabs API
 * Calls the callback with each audio chunk as it's received
 */
export async function streamTextToSpeech(
  text: string,
  onChunk: (audioChunk: Blob) => void,
  onFinish: () => void,
  voiceId: string = DEFAULT_VOICE_ID,
  options: {
    stability?: number;
    similarityBoost?: number;
    model?: string;
    streamingLatency?: number;
  } = {}
) {
  try {
    if (!apiKey) {
      throw new Error('ElevenLabs API key not set');
    }
    
    const { 
      stability = 0.5, 
      similarityBoost = 0.75, 
      model = DEFAULT_MODEL,
      streamingLatency = 0 
    } = options;
    
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream?optimize_streaming_latency=${streamingLatency}`,
      {
        text,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'stream',
      }
    );
    
    const reader = response.data;
    
    reader.on('data', (chunk: Buffer) => {
      const audioChunk = new Blob([chunk], { type: 'audio/mpeg' });
      onChunk(audioChunk);
    });
    
    reader.on('end', () => {
      onFinish();
    });
    
    reader.on('error', (error: Error) => {
      console.error('Error in ElevenLabs streaming:', error);
      onFinish();
    });
  } catch (error) {
    console.error('Error streaming text to speech with ElevenLabs:', error);
    onFinish();
    throw error;
  }
} 