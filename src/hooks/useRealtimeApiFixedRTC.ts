import { useState, useEffect, useRef, useCallback } from 'react';

// Define types for Realtime API events
interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

interface Tool {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  execute: (args: unknown) => Promise<unknown> | unknown;
}

interface UseRealtimeApiRTCProps {
  onMessage?: (message: RealtimeEvent) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  model?: string;
  voice?: string;
  instructions?: string;
  history?: import('@/lib/utils').ChatMessage[];
  tools?: Tool[];
}

interface RealtimeSession {
  client_secret: {
    value: string;
    expires_at: string;
  };
  model: string;
}

interface SessionUpdatePayload {
  type: 'session.update';
  event_id: string;
  session: {
    modalities: string[];
    input_audio_format: string;
    output_audio_format: string;
    voice: string;
    tools?: unknown[];
  };
}

export function useRealtimeApiRTC({
  onMessage,
  onError,
  autoConnect = false,
  model = 'gpt-4o-realtime-preview',
  voice = 'echo',
  instructions = '',
  history = [],
  tools = [],
}: UseRealtimeApiRTCProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Flag to prevent duplicate cleanup calls
  const isCleaningUpRef = useRef(false);
  
  // Helper function to send data through the data channel
  const sendData = useCallback((data: string | object): boolean => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Cannot send data: data channel not open');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      dataChannelRef.current.send(message);
      return true;
    } catch (err) {
      console.error('Error sending data:', err);
      return false;
    }
  }, []);
  
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
        const tracks = mediaStreamRef.current.getTracks();
        for (const track of tracks) {
          track.stop();
        }
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
    setIsListening(false);
    
    setTimeout(() => {
      isCleaningUpRef.current = false;
    }, 500);
  }, []);

  // Send an event to the Realtime API
  const sendEvent = useCallback((event: RealtimeEvent): boolean => {
    if (!isConnected) {
      console.warn('Cannot send event: not connected');
      return false;
    }
    
    console.log('Sending event:', event);
    return sendData(event);
  }, [isConnected, sendData]);
  
  // Send a message
  const sendMessage = useCallback((content: string): boolean => {
    if (!isConnected) {
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
      return sendEvent(message);
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [isConnected, sendEvent]);
  
  // Toggle recording
  const toggleListening = useCallback(() => {
    if (!isConnected) {
      console.warn('Cannot toggle listening: not connected');
      return false;
    }
    
    try {
      if (isListening) {
        // Stop listening
        console.log('Stopping recording');
        sendEvent({ type: 'audio_stop_recording' });
        setIsListening(false);
      } else {
        // Start listening
        console.log('Starting recording');
        sendEvent({ type: 'audio_start_recording' });
        setIsListening(true);
      }
      return true;
    } catch (err) {
      console.error('Error toggling listening:', err);
      return false;
    }
  }, [isConnected, isListening, sendEvent]);

  // Connect to the Realtime API
  const connect = useCallback(async () => {
    console.log('*** CONNECT FUNCTION CALLED ***');
    try {
      if (isConnected || isConnecting) {
        return;
      }
      
      // Reset the cleanup flag
      isCleaningUpRef.current = false;
      
      console.log('Starting connection to Realtime API');
      setIsConnecting(true);
      setError(null);
      
      // Clear any existing connection first to be safe
      cleanup();
      
      // Sleep for a moment to ensure any previous connection is fully cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 1: Get ephemeral token from our API route
      console.log('Requesting ephemeral token from server');
      const tokenResponse = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, voice, instructions }),
      });
      
      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('Failed to get ephemeral token:', tokenResponse.status, errorBody);
        throw new Error(`Failed to get ephemeral token: ${tokenResponse.status} ${errorBody}`);
      }
      
      const sessionData: RealtimeSession = await tokenResponse.json();
      console.log('Received session data:', { 
        hasClientSecret: !!sessionData?.client_secret,
        expires_at: sessionData?.client_secret?.expires_at,
        model: sessionData?.model
      });
      
      if (!sessionData?.client_secret?.value) {
        throw new Error('No client secret in session data');
      }
      
      const ephemeralKey = sessionData.client_secret.value;
      const modelToUse = sessionData.model || model;
      
      // Step 2: Create WebRTC peer connection with ICE servers
      console.log('Creating WebRTC peer connection');
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.ekiga.net' },
          { urls: 'stun:stun.ideasip.com' },
          { urls: 'stun:stun.schlund.de' }
        ],
        iceCandidatePoolSize: 10
      });
      peerConnectionRef.current = pc;
      
      // Add connection state change handlers for debugging
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed to:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'failed') {
          console.error('ICE connection failed:', pc.iceConnectionState);
          cleanup();
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn('ICE connection disconnected, waiting to see if it recovers...');
          // Wait a bit before cleaning up - ICE might recover on its own
          setTimeout(() => {
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
              console.error('ICE connection did not recover, cleaning up');
              cleanup();
            }
          }, 5000);
        } else if (pc.iceConnectionState === 'closed') {
          console.log('ICE connection closed');
          cleanup();
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('Connection state changed to:', pc.connectionState);
        
        if (pc.connectionState === 'failed') {
          console.error('WebRTC connection failed:', pc.connectionState);
          cleanup();
        } else if (pc.connectionState === 'disconnected') {
          console.warn('WebRTC connection disconnected, waiting to see if it recovers...');
          // Wait a bit before cleaning up
          setTimeout(() => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
              console.error('WebRTC connection did not recover, cleaning up');
              cleanup();
            }
          }, 5000);
        } else if (pc.connectionState === 'closed') {
          console.log('WebRTC connection closed');
          cleanup();
        }
      };
      
      // Step 3: Set up audio element for playback
      if (!audioElementRef.current) {
        console.log('Creating audio element');
        const audioEl = new Audio();
        audioEl.autoplay = true;
        audioElementRef.current = audioEl;
      }
      
      // Step 4: Handle incoming audio tracks
      pc.ontrack = (event) => {
        console.log('Received audio track from remote');
        if (audioElementRef.current && event.streams && event.streams[0]) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };
      
      // Step 5: Get microphone access and add audio tracks
      console.log('Requesting microphone access');
      let stream: MediaStream | null = null;
      try {
        const mediaConstraints = { 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        };
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        mediaStreamRef.current = stream;
        console.log('Microphone access granted');
      } catch (err) {
        console.error('Microphone access error:', err);
        const micError = err instanceof Error ? err : new Error('Microphone access denied or not available');
        setError(micError);
        onError?.(micError);
        cleanup();
        return;
      }
      if (stream) {
        console.log('Adding audio tracks to peer connection');
        for (const track of stream.getAudioTracks()) {
          try {
          console.log('Adding audio track to peer connection:', track.label);
          pc.addTrack(track, stream);
          } catch (err) {
            console.warn('Failed to add audio track to peer connection:', err);
          }
        }
      }
      
      // Step 6: Set up data channel
      console.log('Creating data channel');
      const dataChannel = pc.createDataChannel('oai-events', {
        ordered: true
      });
      dataChannelRef.current = dataChannel;
      
      // Set up data channel handlers
      dataChannel.onopen = () => {
        console.log('Data channel onopen event fired.');
        const currentDataChannel = dataChannel; // Capture direct reference
        console.log('Direct data channel reference valid:', !!currentDataChannel);
        console.log('Direct data channel state upon open:', currentDataChannel.readyState);

        setIsConnected(true);
        setIsConnecting(false);

        const sendConfigLogic = (isRetry: boolean) => {
          if (!currentDataChannel) {
            console.error('sendConfigLogic: currentDataChannel is null. This should not happen.');
            return;
          }

          console.log(`Attempting to send session configuration (isRetry: ${isRetry}). State: ${currentDataChannel.readyState}`);

          if (currentDataChannel.readyState === 'open') {
            try {
              console.log('Data channel is confirmed open, sending session configuration...');
              // A complete session.update must include an event_id and the
              // mandatory session fields expected by the Realtime API.  If any
              // of these keys are missing the backend will immediately close
              // the data-channel.  We therefore send the minimal valid set
              // (modalities + input_audio_format) together with the desired
              // voice setting.
              const sessionConfig: SessionUpdatePayload = {
                type: 'session.update',
                event_id: `event_${Date.now()}`,
                session: {
                  modalities: ['text', 'audio'],
                  input_audio_format: 'pcm16',
                  output_audio_format: 'pcm16',
                  voice: voice
                }
              };
              if (tools.length > 0) {
                sessionConfig.session.tools = tools.map(t => ({
                  type: 'function',
                  name: t.name,
                  description: t.description,
                  parameters: t.parameters
                }));
              }
              console.log('Session configuration to send:', sessionConfig);
              currentDataChannel.send(JSON.stringify(sessionConfig));
              console.log('Session configuration sent successfully.');

              // Optionally send a system prompt once after session config
              if (instructions && typeof instructions === 'string' && instructions.trim().length > 0) {
                const sysMsg = {
                  type: 'conversation.item.create',
                  event_id: `event_${Date.now()}`,
                  item: {
                    type: 'message',
                    role: 'system',
                    content: [
                      {
                        type: 'input_text',
                        text: instructions.trim()
                      }
                    ]
                  }
                };
                try {
                  currentDataChannel.send(JSON.stringify(sysMsg));
                  console.log('System prompt sent.');
                } catch (err) {
                  console.error('Failed to send system prompt:', err);
                }
              }

              // Send recent conversation history (last 20 messages) so assistant has context
              if (history && Array.isArray(history) && history.length > 0) {
                const recent = history.slice(-20); // last 20 messages
                let sentCount = 0;
                recent.forEach((msg, idx) => {
                  if (msg.role !== 'user') return; // Only user messages are accepted in beta

                  const histPacket = {
                    type: 'conversation.item.create',
                    event_id: `event_${Date.now()}_${idx}`,
                    item: {
                      type: 'message',
                      role: 'user',
                      content: [
                        {
                          type: 'input_text',
                          text: msg.content
                        }
                      ]
                    }
                  } as const;
                  try {
                    currentDataChannel.send(JSON.stringify(histPacket));
                    sentCount++;
                  } catch (err) {
                    console.error('Failed to send history item', idx, err);
                  }
                });

                console.log(`Sent ${sentCount} user history items to Realtime session.`);
              }
            } catch (err) {
              console.error('Error sending session configuration (even though state was open):', err);
              if (!isRetry) { // If initial direct send failed, start retries
                console.log('Initial send failed, starting retry mechanism.');
                startRetryMechanism();
              }
            }
          } else {
            console.warn(`Data channel not open (state: ${currentDataChannel.readyState}). Needs retry.`);
            if (!isRetry) { // If initial check found not open, start retries
              startRetryMechanism();
            }
          }
        };

        let retryCount = 0;
        const maxRetries = 5;
        const retryInterval = 1000;

        const startRetryMechanism = () => {
          retryCount = 0; // Reset for this mechanism
          const attemptRetry = () => {
            if (retryCount >= maxRetries) {
              console.error('Failed to send session configuration after maximum retries.');
              return;
            }
            retryCount++;
            console.log(`Retry attempt ${retryCount}/${maxRetries}...`);
            // Call sendConfigLogic, indicating it's a retry attempt
            // We expect sendConfigLogic to handle the readyState check internally now
            if (currentDataChannel && currentDataChannel.readyState === 'open') {
                sendConfigLogic(true); // Pass true, but logic mainly checks readyState
            } else if (currentDataChannel) {
                console.warn(`Retry ${retryCount}: Data channel not open (state: ${currentDataChannel.readyState}). Scheduling next retry.`);
                setTimeout(attemptRetry, retryInterval);
            } else {
                console.error(`Retry ${retryCount}: currentDataChannel is null. Cannot retry.`);
            }
          };
          setTimeout(attemptRetry, retryInterval); // Start first retry after interval
        };

        // Attempt to send immediately, or start retries if not possible / fails
        console.log('Performing initial attempt to send configuration or start retries.');
        if (currentDataChannel.readyState === 'open') {
            sendConfigLogic(false); // false indicates it's the initial, direct attempt
        } else {
            console.warn('Data channel not immediately open in onopen handler, starting retry mechanism.');
            startRetryMechanism();
        }
      };
      
      // ---------- handle incoming messages (including function calls) ----------
      const functionCallBuffer: {name?: string; callId?: string; argsFragments: string[]} = { name: undefined, callId: undefined, argsFragments: [] };

      dataChannel.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          // If we get an error message from the API, log it but don't disconnect
          if (data.type === 'error') {
            console.error('Received error from Realtime API:', data);
          } else {
            // Function call handling
            if (data.type === 'response.function_call') {
              functionCallBuffer.name = data.name as string;
              functionCallBuffer.callId = data.call_id as string | undefined;
              functionCallBuffer.argsFragments = [];
            } else if (data.type === 'response.function_call_arguments') {
              if (typeof data.arguments === 'string') {
                functionCallBuffer.argsFragments.push(data.arguments);
              }
            } else if (data.type === 'response.function_call_arguments.done') {
              const fullArgsStr = functionCallBuffer.argsFragments.join('');
              try {
                const args = fullArgsStr ? JSON.parse(fullArgsStr) : {};
                const tool = tools.find(t => t.name === functionCallBuffer.name);
                if (tool) {
                  console.log('Executing local tool', tool.name, args);
                  const output = await tool.execute(args);
                  const responsePacket = {
                    type: 'conversation.item.create',
                    event_id: `event_${Date.now()}`,
                    item: {
                      type: 'function_call_output',
                      call_id: functionCallBuffer.callId || data.call_id || `call_${Date.now()}`,
                      output
                    }
                  } as const;
                  dataChannelRef.current?.send(JSON.stringify(responsePacket));

                  // Trigger assistant continuation
                  dataChannelRef.current?.send(JSON.stringify({ type: 'response.create' }));
                } else {
                  console.warn('Tool not found:', functionCallBuffer.name);
                }
              } catch (e) {
                console.error('Error executing tool:', e);
              }
            }

            // Forward non-tool events to UI
            if (!data.type?.startsWith('response.function_call')) {
              onMessage?.(data);
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };
      
      dataChannel.onclose = (event) => {
        const closedChannel = event.target as RTCDataChannel;
        console.log('Data channel closed with event:', event);
        console.log('State of the channel that closed:', closedChannel?.readyState || 'unknown');
        console.log('Current dataChannelRef.current state:', dataChannelRef.current?.readyState || 'null or not set');
        console.log('Peer connection state:', peerConnectionRef.current?.connectionState);
        console.log('Peer connection ice state:', peerConnectionRef.current?.iceConnectionState);
        console.log('Connection flags:', { isConnected, isConnecting, isCleaningUpRef: isCleaningUpRef.current });
        console.log('isConnectionActive:', isConnectionActive());
        
        if (isConnected) {
          console.log('Connection was previously established, cleaning up safely');
          setIsConnected(false);
          safeCleanup();
        } else {
          console.log('Data channel closed before connection was fully established');
        }
      };
      
      dataChannel.onerror = (err) => {
        console.error('Data channel error:', err);
        console.log('Data channel error details:', {
          type: err.type,
          errorCode: (err as RTCErrorEvent).error?.errorDetail || 'unknown'
        });
        // Don't immediately disconnect on error
      };
      
      // Also handle incoming data channels
      pc.ondatachannel = (event) => {
        console.log('Received data channel from remote');
        const incomingChannel = event.channel;
        
        incomingChannel.onopen = () => {
          console.log('Incoming data channel opened');
        };
        
        incomingChannel.onclose = () => {
          console.log('Incoming data channel closed');
        };
        
        incomingChannel.onerror = (err) => {
          console.error('Incoming data channel error:', err);
        };
        
        incomingChannel.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data);
            console.log('Received message on incoming channel:', data);
            onMessage?.(data);
          } catch (err) {
            console.error('Error parsing message on incoming channel:', err);
          }
        };
      };
      
      // Step 7: Create and send SDP offer
      console.log('Creating and sending SDP offer');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await pc.setLocalDescription(offer);
      
      // Wait for ICE candidate gathering to complete
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
          return;
        }
        
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        
        pc.addEventListener('icegatheringstatechange', checkState);
      });
      
      // Step 8: Send the SDP offer to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      console.log(`Sending SDP offer to ${baseUrl}?model=${modelToUse}`);
      const sdpResponse = await fetch(`${baseUrl}?model=${modelToUse}`, {
        method: 'POST',
        body: pc.localDescription?.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
          'OpenAI-Beta': 'realtime=v1'
        },
      });
      
      if (!sdpResponse.ok) {
        const errorBody = await sdpResponse.text();
        console.error('Failed to get SDP answer:', sdpResponse.status, errorBody);
        throw new Error(`Failed to get SDP answer: ${sdpResponse.status} ${errorBody}`);
      }
      
      // Step 9: Process the SDP answer
      const sdpAnswerText = await sdpResponse.text();
      console.log('Received SDP answer');
      
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: sdpAnswerText,
      };
      
      console.log('Setting remote description');
      try {
      await pc.setRemoteDescription(answer);
      console.log('Remote description set, connection established');
      } catch (err) {
        console.error('Error setting remote description:', err);
        const remoteError = err instanceof Error ? err : new Error(String(err));
        setError(remoteError);
        onError?.(remoteError);
        cleanup();
        return;
      }
      
    } catch (err) {
      console.error('Connection error:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      cleanup();
      throw error;
    }
  }, [isConnected, isConnecting, model, voice, instructions, onMessage, onError, cleanup, history, tools]);
  
  // Check if the connection is really active (combining multiple states)
  const isConnectionActive = useCallback(() => {
    const pc = peerConnectionRef.current;
    const dc = dataChannelRef.current;
    return (
      pc !== null &&
      dc !== null &&
      pc.connectionState === 'connected' &&
      dc.readyState === 'open'
    );
  }, []);

  // Safe cleanup that checks if we need to clean up
  const safeCleanup = useCallback(() => {
    if (isConnectionActive()) {
      console.log('Running cleanup for active connection');
      cleanup();
    } else if (isConnected) {
      console.log('Connection state mismatch detected, resetting state');
      setIsConnected(false);
      cleanup();
    } else {
      console.log('Connection already cleaned up, skipping');
    }
  }, [isConnected, isConnectionActive, cleanup]);

  // Disconnect from the Realtime API with safe handling
  const disconnect = useCallback(() => {
    console.log('Disconnecting from Realtime API');
    safeCleanup();
  }, [safeCleanup]);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: run only on mount/unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, []);
  
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