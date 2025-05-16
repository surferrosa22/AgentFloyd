import { useState, useEffect, useRef, useCallback } from 'react';

// Define types for Realtime API events
interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

interface UseRealtimeApiWsProps {
  onMessage?: (message: RealtimeEvent) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  model?: string;
  voice?: string;
}

interface RealtimeSession {
  client_secret: {
    value: string;
    expires_at: string;
  };
  model: string;
}

export function useRealtimeApiWs({
  onMessage,
  onError,
  autoConnect = false,
  model = 'gpt-3.5-turbo',
  voice = 'alloy',
}: UseRealtimeApiWsProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Flag to prevent duplicate cleanup calls
  const isCleaningUpRef = useRef(false);
  
  // Add a ref to cache session data and reduce latency
  const sessionDataRef = useRef<RealtimeSession | null>(null);
  
  // Prefetch session data (ephemeral token) on mount or when model/voice change
  const fetchSessionData = useCallback(async (): Promise<RealtimeSession | null> => {
    try {
      // Reuse token if not expired
      if (sessionDataRef.current && new Date(sessionDataRef.current.client_secret.expires_at) > new Date()) {
        return sessionDataRef.current;
      }
      console.log('Prefetching ephemeral token for Realtime API');
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, voice }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to prefetch ephemeral token:', response.status, text);
        throw new Error(`Failed to prefetch ephemeral token: ${response.status} ${text}`);
      }
      const session = await response.json() as RealtimeSession;
      sessionDataRef.current = session;
      return session;
    } catch (err) {
      console.error('Error prefetching session data:', err);
      return null;
    }
  }, [model, voice]);
  
  // Prefetch the token when the hook mounts for faster connect
  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    // Prevent duplicate cleanup calls
    if (isCleaningUpRef.current) {
      console.log('Cleanup already in progress, skipping');
      return;
    }
    
    isCleaningUpRef.current = true;
    console.log('Cleaning up WebSocket connection');
    
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      }
      wsRef.current = null;
    }
    
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      } catch (err) {
        console.error('Error cleaning up audio:', err);
      }
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsListening(false);
    
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 500);
  }, []);
  
  // Connect to the Realtime API using WebSockets
  const connect = useCallback(async () => {
    try {
      if (isConnected || isConnecting) {
        return;
      }
      
      // Reset the cleanup flag
      isCleaningUpRef.current = false;
      
      console.log('Starting connection to Realtime API via WebSockets');
      setIsConnecting(true);
      setError(null);
      
      // Use prefetched session data or fetch if needed
      const session = await fetchSessionData();
      if (!session?.client_secret?.value) {
        throw new Error('No client secret in session data');
      }
      const ephemeralKey = session.client_secret.value;
      const modelToUse = session.model || model;
      
      // 2. Create WebSocket connection
      console.log('Creating WebSocket connection');
      
      // Create WebSocket connection with the appropriate protocols
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${modelToUse}`;
      const ws = new WebSocket(wsUrl, [
        'realtime',
        `openai-insecure-api-key.${ephemeralKey}`,
        'openai-beta.realtime-v1'
      ]);
      
      wsRef.current = ws;
      
      // Set up WebSocket event handlers
      ws.onopen = () => {
        console.log('WebSocket connection opened');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Initialize the audio element
        if (!audioElementRef.current) {
          console.log('Creating audio element');
          const audioContext = new AudioContext();
          const audioElement = new Audio();
          audioElement.autoplay = true;
          audioElementRef.current = audioElement;
        }
        
        // Send a ping message to test the connection
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping message');
        } catch (err) {
          console.error('Error sending ping:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        if (isConnected) {
          setIsConnected(false);
          cleanup();
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        const errorMsg = 'WebSocket connection error';
        setError(new Error(errorMsg));
        onError?.(new Error(errorMsg));
        cleanup();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          // If it's an audio message, play it
          if (data.type === 'audio') {
            if (audioElementRef.current && data.audio && data.audio.data) {
              // Create an audio blob and play it
              try {
                const audioData = atob(data.audio.data);
                const audioArrayBuffer = new ArrayBuffer(audioData.length);
                const audioBufferView = new Uint8Array(audioArrayBuffer);
                
                for (let i = 0; i < audioData.length; i++) {
                  audioBufferView[i] = audioData.charCodeAt(i);
                }
                
                const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                audioElementRef.current.src = audioUrl;
                audioElementRef.current.play().catch(err => {
                  console.error('Error playing audio:', err);
                });
              } catch (err) {
                console.error('Error processing audio data:', err);
              }
            }
          }
          
          // Pass the message to the callback
          onMessage?.(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
    } catch (err) {
      console.error('Connection error:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
      cleanup();
    }
  }, [isConnected, isConnecting, model, onMessage, onError, cleanup, fetchSessionData]);
  
  // Disconnect from the Realtime API
  const disconnect = useCallback(() => {
    console.log('Disconnecting from Realtime API');
    cleanup();
  }, [cleanup]);
  
  // Toggle recording
  const toggleListening = useCallback(() => {
    if (!isConnected || !wsRef.current) {
      console.warn('Cannot toggle listening: not connected');
      return false;
    }
    
    try {
      if (isListening) {
        // Stop listening
        console.log('Stopping recording');
        wsRef.current.send(JSON.stringify({ 
          type: 'audio_stop_recording' 
        }));
        setIsListening(false);
      } else {
        // Start listening
        console.log('Starting recording');
        wsRef.current.send(JSON.stringify({ 
          type: 'audio_start_recording' 
        }));
        setIsListening(true);
      }
      return true;
    } catch (err) {
      console.error('Error toggling listening:', err);
      return false;
    }
  }, [isConnected, isListening]);
  
  // Send an event to the Realtime API
  const sendEvent = useCallback((event: RealtimeEvent) => {
    if (!isConnected || !wsRef.current) {
      console.warn('Cannot send event: not connected');
      return false;
    }
    
    try {
      const message = typeof event === 'string' ? event : JSON.stringify(event);
      console.log('Sending event:', event);
      wsRef.current.send(message);
      return true;
    } catch (err) {
      console.error('Error sending event:', err);
      return false;
    }
  }, [isConnected]);
  
  // Send a message
  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !wsRef.current) {
      console.warn('Cannot send message: not connected');
      return false;
    }
    
    try {
      const message = {
        type: 'message',
        message: {
          role: 'user',
          content: content
        }
      };
      
      console.log('Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [isConnected]);
  
  // Connect automatically if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      cleanup();
    };
  }, [autoConnect, connect, cleanup]);
  
  return {
    isConnected,
    isConnecting,
    isListening,
    error,
    connect,
    disconnect,
    toggleListening,
    sendEvent,
    sendMessage
  };
} 