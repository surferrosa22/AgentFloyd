"use client";

import { useState, useCallback, useRef } from 'react';
import { getVoiceRecognition, VoiceRecognitionOptions } from '@/lib/voice-recognition';

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const callbackRef = useRef<((text: string) => void) | null>(null);

  // Clear silence detection timeout
  const clearSilenceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle end of speech with silence detection
  const handleSpeechEnd = useCallback(() => {
    if (continuousMode && callbackRef.current && lastTranscriptRef.current) {
      // Send the final transcript when silence is detected
      callbackRef.current(lastTranscriptRef.current);
      lastTranscriptRef.current = ''; // Reset transcript

      // In continuous mode, automatically restart listening after processing
      setTimeout(() => {
        const voiceRecognition = getVoiceRecognition();
        if (!voiceRecognition.getListeningState()) {
          voiceRecognition.start();
        }
      }, 1000);
    }

    setIsListening(false);
  }, [continuousMode]);

  // Start speech recognition
  const startListening = useCallback((onTranscript: (text: string) => void, continuous = false) => {
    // Store callback for later use in silence detection
    callbackRef.current = onTranscript;
    setContinuousMode(continuous);
    lastTranscriptRef.current = '';

    const options: VoiceRecognitionOptions = {
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        // In continuous mode, we wait for silence before sending the transcript
        if (continuous) {
          lastTranscriptRef.current = transcript;

          // Reset silence detection timeout
          clearSilenceTimeout();

          // Set a new timeout to detect when speech has ended
          timeoutRef.current = setTimeout(() => {
            handleSpeechEnd();
          }, 2000); // 2 seconds of silence triggers "speech ended"
        } else {
          // In regular mode, immediately send each transcript
          if (onTranscript) onTranscript(transcript);
        }
      },
      onEnd: () => {
        // If recognition ends and we're in continuous mode, restart it
        if (continuous) {
          clearSilenceTimeout();

          // Only if we have a transcript and aren't manually stopping
          if (lastTranscriptRef.current && callbackRef.current) {
            callbackRef.current(lastTranscriptRef.current);
            lastTranscriptRef.current = '';

            // Restart after processing
            setTimeout(() => {
              const voiceRecognition = getVoiceRecognition();
              if (!voiceRecognition.getListeningState()) {
                voiceRecognition.start();
              }
            }, 1000);
          }
        }
        setIsListening(false);
      },
      onError: (error: unknown) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);

        // On error in continuous mode, try to restart after a delay
        if (continuous) {
          setTimeout(() => {
            const voiceRecognition = getVoiceRecognition();
            if (!voiceRecognition.getListeningState()) {
              voiceRecognition.start();
            }
          }, 3000);
        }
      },
      continuous: true, // Always use continuous recognition
      interimResults: true
    };

    const voiceRecognition = getVoiceRecognition(options);

    if (!voiceRecognition.isSupported()) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return false;
    }

    return voiceRecognition.start();
  }, [clearSilenceTimeout, handleSpeechEnd]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    clearSilenceTimeout();
    setContinuousMode(false);
    lastTranscriptRef.current = '';
    callbackRef.current = null;

    const voiceRecognition = getVoiceRecognition();
    voiceRecognition.stop();
    setIsListening(false);
  }, [clearSilenceTimeout]);

  // Toggle speech recognition
  const toggleListening = useCallback((onTranscript: (text: string) => void, continuous = false) => {
    if (isListening) {
      stopListening();
      return false;
    } else {
      return startListening(onTranscript, continuous);
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    continuousMode,
    startListening,
    stopListening,
    toggleListening
  };
}