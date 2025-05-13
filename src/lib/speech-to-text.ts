import OpenAI from 'openai';
import { openai } from './openai';

export async function transcribeAudio(audioData: Blob): Promise<{ text: string; error?: null } | { text: null; error: string }> {
  try {
    // Convert the Blob to a File
    const audioFile = new File(
      [audioData], 
      'voice-recording.webm', 
      { type: audioData.type }
    );

    // Create a FormData instance and append the file
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    // Send the transcription request
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    return { text: response.text, error: null };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return { 
      text: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}