import { useState, useEffect, useRef, useCallback } from 'react';

interface UseRealtimeApiProps {
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  autoConnect?: boolean;
  model?: string;
  voice?: string;
}

interface RealtimeSession {
  client_secret: {
    value: string;
    expires_at: string;
  };
}

export function useRealtimeApi({
  onMessage,
  onError,
  autoConnect = false,
  model = 'gpt-4o-mini-realtime',
  voice = 'alloy',
}: UseRealtimeApiProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Flag to prevent duplicate cleanup calls
  const isCleaningUpRef = useRef(false);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    // Prevent duplicate cleanup calls
    if (isCleaningUpRef.current) {
      console.log('Cleanup already in progress, skipping');
      return;
    }
    
    isCleaningUpRef.current = true;
    console.log('Cleaning up WebRTC connection');
    
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (err) {
        console.error('Error closing data channel:', err);
      }
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (err) {
        console.error('Error closing peer connection:', err);
      }
      peerConnectionRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Error stopping media tracks:', err);
      }
      mediaStreamRef.current = null;
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 500);
  }, []);

  // Connect to the Realtime API
  const connect = useCallback(async () => {
    try {
      if (isConnected || isConnecting) {
        return;
      }
      
      // Reset the cleanup flag
      isCleaningUpRef.current = false;
      
      console.log('Starting connection to Realtime API');
      setIsConnecting(true);
      setError(null);
      
      // 1. Get ephemeral token from our API route
      console.log('Requesting ephemeral token from server');
      const tokenResponse = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, voice }),
      });
      
      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('Failed to get ephemeral token:', tokenResponse.status, errorBody);
        throw new Error(`Failed to get ephemeral token: ${tokenResponse.status} ${errorBody}`);
      }
      
      const sessionData: RealtimeSession = await tokenResponse.json();
      console.log('Received session data:', { 
        hasClientSecret: !!sessionData?.client_secret,
        expires_at: sessionData?.client_secret?.expires_at 
      });
      
      if (!sessionData?.client_secret?.value) {
        throw new Error('No client secret in session data');
      }
      
      const ephemeralKey = sessionData.client_secret.value;
      
      // 2. Create WebRTC peer connection
      console.log('Creating WebRTC peer connection');
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;
      
      // Add event listeners for connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed to:', pc.iceConnectionState);
        
        // If ICE connection fails, clean up
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
          console.error('ICE connection failed or closed');
          cleanup();
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('Connection state changed to:', pc.connectionState);
        
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          console.error('WebRTC connection closed or failed:', pc.connectionState);
          cleanup();
        }
      };
      
      // 3. Set up audio element for playback
      if (!audioElementRef.current) {
        console.log('Creating audio element');
        const audioEl = new Audio();
        audioEl.autoplay = true;
        audioElementRef.current = audioEl;
      }
      
      // 4. Handle incoming audio stream
      pc.ontrack = (event) => {
        console.log('Received audio track from remote');
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };
      
      // 5. Add local audio track from microphone
      try {
        console.log('Requesting microphone access');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log('Microphone access granted, adding tracks');
        
        for (const track of stream.getAudioTracks()) {
          pc.addTrack(track, stream);
        }
      } catch (err) {
        console.error('Microphone access error:', err);
        throw new Error('Microphone access denied or not available');
      }
      
      // 6. Set up data channel for sending/receiving events
      console.log('Creating data channel');
      const dataChannel = pc.createDataChannel('oai-events', {
        ordered: true
      });
      dataChannelRef.current = dataChannel;
      
      // Set up data channel event handlers
      dataChannel.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Send a ping message to test the connection
        try {
          dataChannel.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping message');
        } catch (err) {
          console.error('Error sending ping:', err);
        }
      };
      
      dataChannel.onclose = () => {
        console.log('Data channel closed');
        if (isConnected) {
          setIsConnected(false);
          cleanup();
        }
      };
      
      dataChannel.onerror = (event) => {
        console.error('Data channel error:', event);
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          onMessage?.(data);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };
      
      // Also handle the ondatachannel event
      pc.ondatachannel = (event) => {
        console.log('Received data channel from remote');
        const receivedChannel = event.channel;
        
        receivedChannel.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data);
            console.log('Received message on remote channel:', data);
            onMessage?.(data);
          } catch (err) {
            console.error('Error parsing message on remote channel:', err);
          }
        };
      };
      
      // 7. Create and send offer
      console.log('Creating and sending SDP offer');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const baseUrl = 'https://api.openai.com/v1/realtime';
      console.log(`Sending SDP offer to ${baseUrl}?model=${model}`);
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
          'OpenAI-Beta': 'realtime=v1'
        },
      });
      
      if (!sdpResponse.ok) {
        const errorBody = await sdpResponse.text();
        console.error('Failed to get SDP answer:', sdpResponse.status, errorBody);
        throw new Error(`Failed to get SDP answer: ${sdpResponse.status} ${errorBody}`);
      }
      
      const sdpAnswerText = await sdpResponse.text();
      console.log('Received SDP answer');
      
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: sdpAnswerText,
      };
      
      console.log('Setting remote description');
      await pc.setRemoteDescription(answer);
      console.log('Remote description set, connection established');
      
      // Send initial audio_start_recording event after a short delay to ensure connection is stable
      setTimeout(() => {
        if (isConnected && dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          console.log('Sending initial audio_start_recording');
          sendEvent({ type: 'audio_start_recording' });
        }
      }, 1000);
      
    } catch (err) {
      console.error('Connection error:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      cleanup();
    }
  }, [isConnected, isConnecting, model, voice, onMessage, onError, cleanup]);
  
  // Disconnect from the Realtime API
  const disconnect = useCallback(() => {
    console.log('Disconnecting from Realtime API');
    cleanup();
  }, [cleanup]);
  
  // Send an event to the Realtime API
  const sendEvent = useCallback((event: any) => {
    if (!isConnected || !dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Cannot send event: not connected or channel not open');
      return false;
    }
    
    try {
      const message = typeof event === 'string' ? event : JSON.stringify(event);
      console.log('Sending event:', event);
      dataChannelRef.current.send(message);
      return true;
    } catch (err) {
      console.error('Error sending event:', err);
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
    error,
    connect,
    disconnect,
    sendEvent,
  };
} 