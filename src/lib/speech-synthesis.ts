/**
 * Speech synthesis utility for text-to-speech functionality
 */

export interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export class SpeechSynthesizer {
  private static instance: SpeechSynthesizer;
  private utterance: SpeechSynthesisUtterance | null = null;
  private options: SpeechSynthesisOptions;
  private speaking: boolean = false;

  private constructor(options: SpeechSynthesisOptions = {}) {
    this.options = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      ...options
    };
  }

  public static getInstance(options?: SpeechSynthesisOptions): SpeechSynthesizer {
    if (!SpeechSynthesizer.instance) {
      SpeechSynthesizer.instance = new SpeechSynthesizer(options);
    } else if (options) {
      SpeechSynthesizer.instance.updateOptions(options);
    }
    return SpeechSynthesizer.instance;
  }

  public updateOptions(options: SpeechSynthesisOptions): void {
    this.options = { ...this.options, ...options };
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }

  public speak(text: string): boolean {
    if (!this.isSupported()) {
      console.error('Speech synthesis is not supported in this browser');
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    try {
      console.log("Starting speech synthesis for:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
      this.utterance = new SpeechSynthesisUtterance(text);

      // Apply options
      if (this.options.voice) {
        console.log("Using voice:", this.options.voice.name);
        this.utterance.voice = this.options.voice;
      }
      if (this.options.rate) this.utterance.rate = this.options.rate;
      if (this.options.pitch) this.utterance.pitch = this.options.pitch;
      if (this.options.volume) this.utterance.volume = this.options.volume;

      // Set event handlers
      this.utterance.onstart = () => {
        console.log("Speech started");
        this.speaking = true;
        if (this.options.onStart) this.options.onStart();
      };

      this.utterance.onend = () => {
        console.log("Speech ended");
        this.speaking = false;
        if (this.options.onEnd) this.options.onEnd();
      };

      this.utterance.onerror = (event) => {
        this.speaking = false;
        console.error('Speech synthesis error:', event);
        if (this.options.onError) this.options.onError(event);
      };

      // Start speaking
      window.speechSynthesis.speak(this.utterance);

      // Chrome bug workaround - sometimes utterances get stuck
      if (this.utterance.voice && this.utterance.voice.name.includes('Google')) {
        console.log("Applying Chrome speech synthesis workaround");
        setTimeout(() => {
          const speakingCheck = window.speechSynthesis.speaking;
          if (!speakingCheck && this.speaking) {
            console.log("Speech didn't start properly, retrying...");
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(this.utterance!);
          }
        }, 250);
      }

      return true;
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      if (this.options.onError) this.options.onError(error);
      return false;
    }
  }

  public stop(): void {
    if (!this.isSupported()) return;
    
    try {
      window.speechSynthesis.cancel();
      this.speaking = false;
    } catch (error) {
      console.error('Error stopping speech synthesis:', error);
    }
  }

  public pause(): void {
    if (!this.isSupported() || !this.speaking) return;
    
    try {
      window.speechSynthesis.pause();
    } catch (error) {
      console.error('Error pausing speech synthesis:', error);
    }
  }

  public resume(): void {
    if (!this.isSupported()) return;
    
    try {
      window.speechSynthesis.resume();
    } catch (error) {
      console.error('Error resuming speech synthesis:', error);
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }
}

// Helper function to get available voices
export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    
    // Get voices if already loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Otherwise wait for voices to be loaded
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

// Helper function to get a specific voice by language and name
export const getVoiceByLanguageAndName = async (
  language: string = 'en', 
  name?: string
): Promise<SpeechSynthesisVoice | null> => {
  const voices = await getAvailableVoices();
  
  // Filter by language first
  const languageVoices = voices.filter(voice => 
    voice.lang.toLowerCase().startsWith(language.toLowerCase())
  );
  
  if (languageVoices.length === 0) return null;
  
  // If name is provided, try to find that specific voice
  if (name) {
    const namedVoice = languageVoices.find(voice => 
      voice.name.toLowerCase().includes(name.toLowerCase())
    );
    if (namedVoice) return namedVoice;
  }
  
  // Otherwise return the first voice for that language
  return languageVoices[0];
};

// Singleton instance for easy access
export const speechSynthesizer = SpeechSynthesizer.getInstance();