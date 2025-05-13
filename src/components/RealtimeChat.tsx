import { useState, useEffect, useRef } from 'react';
import { useRealtimeApi } from '@/hooks/useRealtimeApi';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  final?: boolean;
}

// Define types for Realtime API events
interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

// Generate a unique ID for messages
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function RealtimeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize the Realtime API hook
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendEvent,
  } = useRealtimeApi({
    onMessage: handleMessage,
    onError: (err) => {
      console.error('Realtime API error:', err);
      // Add error as system message
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'system',
        content: `Error: ${err.message}`,
        final: true
      }]);
    }
  });

  // Automatically scroll to the bottom when needed
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle incoming messages from the Realtime API
  function handleMessage(event: RealtimeEvent) {
    console.log('Received event:', event);

    if (event.type === 'message_start') {
      // Start of a new assistant message
      setMessages(prev => [...prev, { 
        id: generateId(),
        role: 'assistant', 
        content: '', 
        final: false 
      }]);
    } 
    else if (event.type === 'content_block_delta') {
      const delta = event.delta as { content_block: { type: string, text: string } };
      if (delta.content_block.type === 'text') {
        // Update the last message with new content
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += delta.content_block.text;
          }
          
          return newMessages;
        });
      }
    } 
    else if (event.type === 'message_complete') {
      // Mark the message as final
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.final = true;
        }
        
        return newMessages;
      });
    }
    else if (event.type === 'transcript') {
      const transcript = event.transcript as { text: string, final: boolean };
      // Update the current transcript
      setCurrentTranscript(transcript.text);
      
      // If this is the final transcript, send it to the API
      if (transcript.final) {
        const userMessage = transcript.text.trim();
        
        if (userMessage) {
          // Add the user message to the messages array
          setMessages(prev => [...prev, { 
            id: generateId(),
            role: 'user', 
            content: userMessage, 
            final: true 
          }]);
          
          // Send the message to the API
          sendEvent({
            type: 'message',
            message: {
              role: 'user',
              content: userMessage,
            },
          });
        }
        
        // Clear the current transcript
        setCurrentTranscript('');
      }
    }

    // Always scroll to bottom when new messages arrive
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  // Toggle listening state
  function toggleListening() {
    if (isListening) {
      // Stop listening
      sendEvent({ type: 'audio_stop_recording' });
      setIsListening(false);
    } else {
      // Start listening
      sendEvent({ type: 'audio_start_recording' });
      setIsListening(true);
    }
  }

  // Connect to the API
  function handleConnect() {
    if (isConnected) {
      disconnect();
    } else {
      // Add an initial system message
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'system',
        content: 'Connecting to Realtime API...',
        final: true
      }]);
      connect();
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <h2 className="text-xl font-bold mb-2">Realtime Chat</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
          <strong>Note:</strong> OpenAI's Realtime API is in beta and requires special access. If you're getting authorization errors, your API key might not have access to this feature yet. 
          <a 
            href="https://platform.openai.com/docs/api-reference/realtime-sessions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline ml-1"
          >
            Learn more
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
          </Button>
          
          {isConnected && (
            <Button
              onClick={toggleListening}
              className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
              disabled={!isConnected}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <div className="font-semibold">Error:</div>
            <div className="text-sm break-words whitespace-pre-wrap">{error.message}</div>
            
            {error.message.includes('401') && (
              <div className="mt-2 text-sm">
                <strong>Access Issue:</strong> Your API key might not have access to the Realtime API beta.
              </div>
            )}
            
            {error.message.includes('permission') && (
              <div className="mt-2 text-sm">
                <strong>Microphone Access:</strong> Please allow microphone access in your browser settings.
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900 ml-auto' 
                : message.role === 'system'
                  ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <div className="text-sm font-semibold mb-1">
              {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        
        {currentTranscript && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 ml-auto max-w-[80%] opacity-70">
            <div className="text-sm font-semibold mb-1">You (typing...)</div>
            <div>{currentTranscript}</div>
          </div>
        )}
        
        <div ref={messageEndRef} />
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isListening 
            ? 'Listening... Speak to send a message.' 
            : isConnected 
              ? 'Click "Start Listening" to speak'
              : 'Connect to start a conversation'}
        </div>
      </div>
    </div>
  );
} 