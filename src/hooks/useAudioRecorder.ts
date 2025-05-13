import { useRef, useState, useCallback } from 'react';
import axios from 'axios';

interface UseAudioRecorderOptions {
  onData?: (chunk: Blob) => void;
  mimeType?: string;
  onTranscription?: (text: string) => void;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { onData, mimeType = 'audio/webm', onTranscription } = options;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioChunks([]);
    setAudioBlob(null);
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setAudioChunks((prev) => [...prev, e.data]);
          if (onData) onData(e.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        // Automatically send the audio for transcription
        if (onTranscription) {
          await transcribeAudio(blob);
        }
      };
      recorder.start(200); // emit data every 200ms for streaming
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not start recording';
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [mimeType, onData, onTranscription]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  }, []);

  const transcribeAudio = async (blob: Blob) => {
    try {
      setIsTranscribing(true);

      // Create FormData and append the audio blob
      const formData = new FormData();
      formData.append('audio', blob);

      // Send to our API endpoint
      const response = await axios.post('/api/speech', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success && response.data.text) {
        setTranscript(response.data.text);
        if (onTranscription) {
          onTranscription(response.data.text);
        }
      } else {
        throw new Error(response.data.error || 'Failed to transcribe audio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error transcribing audio';
      setError(errorMessage);
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioChunks,
    audioBlob,
    error,
    isTranscribing,
    transcript,
    transcribeAudio
  };
} 