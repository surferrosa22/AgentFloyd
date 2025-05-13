/**
 * A simple voice recognition utility using the Web Speech API
 */

// Define Web Speech API TypeScript interfaces if they don't already exist
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (ev: Event) => void;
  onresult: (ev: SpeechRecognitionEvent) => void;
  onerror: (ev: SpeechRecognitionErrorEvent) => void;
  onend: (ev: Event) => void;
  start(): void;
  stop(): void;
}

// TypeScript declaration for browser support
declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export interface VoiceRecognitionOptions {
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private options: VoiceRecognitionOptions;

  constructor(options: VoiceRecognitionOptions = {}) {
    this.options = {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      ...options
    };
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public start(): boolean {
    if (this.isListening) return false;
    if (!this.isSupported()) {
      console.error('Speech recognition is not supported in this browser');
      return false;
    }

    try {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
      
      // Configure the recognition
      if (this.options.continuous !== undefined) {
        this.recognition.continuous = this.options.continuous;
      }
      
      if (this.options.interimResults !== undefined) {
        this.recognition.interimResults = this.options.interimResults;
      }
      
      if (this.options.lang) {
        this.recognition.lang = this.options.lang;
      }
      
      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.options.onStart) this.options.onStart();
      };
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(Array.prototype.slice.call(event.results))
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result: SpeechRecognitionAlternative) => result.transcript)
          .join('');
          
        if (this.options.onResult) this.options.onResult(transcript);
      };
      
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (this.options.onError) this.options.onError(event.error);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.options.onEnd) this.options.onEnd();
      };
      
      // Start the recognition
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.options.onError) this.options.onError(error);
      return false;
    }
  }

  public stop(): void {
    if (!this.isListening || !this.recognition) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  public toggle(): boolean {
    return this.isListening ? (this.stop(), false) : this.start();
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

// Singleton instance for easy use
let voiceRecognitionInstance: VoiceRecognition | null = null;

export const getVoiceRecognition = (options?: VoiceRecognitionOptions): VoiceRecognition => {
  if (!voiceRecognitionInstance) {
    voiceRecognitionInstance = new VoiceRecognition(options);
  } else if (options) {
    // Update options if provided
    voiceRecognitionInstance.stop();
    voiceRecognitionInstance = new VoiceRecognition(options);
  }
  
  return voiceRecognitionInstance;
};