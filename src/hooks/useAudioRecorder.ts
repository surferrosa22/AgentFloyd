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

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioChunks([]);
    setAudioBlob(null);
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
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        for (const track of stream.getTracks()) {
          track.stop();
        }
      };
      recorder.start(200); // emit data every 200ms for streaming
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not start recording';
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [mimeType, onData]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioChunks,
    audioBlob,
    error
  };
} 