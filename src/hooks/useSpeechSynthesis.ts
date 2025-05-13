import { useState, useEffect, useCallback } from 'react';
import { 
  SpeechSynthesizer, 
  SpeechSynthesisOptions, 
  getVoiceByLanguageAndName 
} from '@/lib/speech-synthesis';

interface UseSpeechSynthesisOptions extends SpeechSynthesisOptions {
  autoVoice?: boolean;
  preferredVoiceName?: string;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    // Check if speech synthesis is supported
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (!supported) {
      setError('Speech synthesis is not supported in this browser');
      return;
    }

    // Initialize speech synthesizer with options
    const synth = SpeechSynthesizer.getInstance({
      ...options,
      onStart: () => {
        setIsSpeaking(true);
        if (options.onStart) options.onStart();
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (options.onEnd) options.onEnd();
      },
      onError: (err) => {
        setIsSpeaking(false);
        const errorMessage = err instanceof Error ? err.message : 'Speech synthesis error';
        setError(errorMessage);
        if (options.onError) options.onError(err);
      }
    });

    // Auto-select a voice if requested
    if (options.autoVoice) {
      getVoiceByLanguageAndName('en', options.preferredVoiceName)
        .then(voice => {
          setSelectedVoice(voice);
          if (voice) {
            synth.updateOptions({ voice });
          }
        });
    }

    return () => {
      // Stop any ongoing speech when component unmounts
      synth.stop();
    };
  }, []);

  // Update selected voice when it changes
  useEffect(() => {
    if (selectedVoice) {
      const synth = SpeechSynthesizer.getInstance();
      synth.updateOptions({ voice: selectedVoice });
    }
  }, [selectedVoice]);

  // Speak text
  const speak = useCallback((text: string): boolean => {
    setError(null);
    const synth = SpeechSynthesizer.getInstance();

    try {
      return synth.speak(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to speak';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Stop speaking
  const stop = useCallback(() => {
    const synth = SpeechSynthesizer.getInstance();
    synth.stop();
    setIsSpeaking(false);
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    const synth = SpeechSynthesizer.getInstance();
    return synth.getVoices();
  }, []);

  // Change voice
  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
    error,
    selectedVoice,
    changeVoice,
    getVoices
  };
}