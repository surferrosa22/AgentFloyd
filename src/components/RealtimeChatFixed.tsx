"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRealtimeApiRTC } from '@/hooks/useRealtimeApiFixedRTC';
import { Button } from '@/components/ui/button';
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useChat } from '@/lib/chat-context';
import type { ChatMessage } from '@/lib/utils';
import { Mic, MicOff, LoaderIcon, SendIcon, XIcon } from 'lucide-react';
import { motion } from "framer-motion";

// Define types for Realtime API events
interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

// Generate a unique ID for messages
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper: current ISO time
const getTimeTool = {
  name: 'get_time',
  description: 'Returns the current date & time along with timezone info',
  execute: () => {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetMinutes = -now.getTimezoneOffset(); // positive east of UTC
    const offsetHours = offsetMinutes / 60;
    return {
      local: now.toLocaleString(undefined, { hour12: false }),
      iso_utc: now.toISOString(),
      timezone: tz,
      offset_hours: offsetHours,
      offset_minutes: offsetMinutes
    };
  }
};

type VoiceOption = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

// Local message type used inside the modal for streaming.
interface LocalMessage extends ChatMessage {
  final?: boolean;
}

export function RealtimeChatFixed() {
  console.log('*** RealtimeChatFixed COMPONENT RENDERED ***');

  // Global chat context (main chat panel)
  const { addMessage, messages: globalMessages } = useChat();

  // Local messages for real-time streaming inside the modal
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  // On first mount, seed the modal with the existing global chat history
  useEffect(() => {
    if (messages.length === 0 && globalMessages.length > 0) {
      // Cast to LocalMessage by spreading and adding final flag
      setMessages(globalMessages.map(msg => ({ ...msg, final: true })));
    }
    // Safe dependencies; will only run again when globalMessages updates and local is empty
  }, [globalMessages, messages.length]);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  // Voice selection (must be chosen before connecting)
  const [voiceSelection, setVoiceSelection] = useState<VoiceOption>('echo');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Initialize the Realtime API hook
  const {
    sendEvent,
    sendMessage,
    disconnect,
    isConnected,
    isConnecting,
    isListening,
    error,
    connect,
  } = useRealtimeApiRTC({
    onMessage: (data: any) => {
      try {
        console.log('[RTF] Data message received:', data);
        
        const event = data as RealtimeEvent;
        
        // Handle different event types from the RTF server
        if (event.type === 'ack') {
          // Server acknowledgment
          console.log('[RTF] Server acknowledged:', event);
        }
        else if (event.type === 'message') {
          // A completed message to display
          console.log('[RTF] Chat message event:', event);
          
          // New completed message
          if (event.content) {
            const msg: LocalMessage = {
              id: event.id ? String(event.id) : generateId(),
              role: 'assistant',
              content: String(event.content),
              timestamp: Date.now(),
              final: true, // This is a complete message
            };
            
            // Update the message list with the new complete message
            setMessages((prev) => {
              // If this is a duplicate ID (which can happen if streaming was used), replace it
              const existingMsgIndex = prev.findIndex(m => m.id === msg.id);
              if (existingMsgIndex >= 0) {
                const newMessages = [...prev];
                newMessages[existingMsgIndex] = msg;
                return newMessages;
              } else {
                // Otherwise append a new message
                return [...prev, msg];
              }
            });
            
            // Also add to the global chat context to sync the transcription
            addMessage(msg.content, msg.role);
          }
        }
        else if (event.type === 'transcript') {
          // Update the ongoing transcription
          const transcript = event.content ? String(event.content) : '';
          console.log('[RTF] Transcript:', transcript);
          setCurrentTranscript(transcript);
        }
        else if (event.type === 'error') {
          console.error('[RTF] Server error:', event);
          // Handle error here - could add to message list
        }
        else {
          console.log('[RTF] Unknown event type:', event);
        }
      } catch (err) {
        console.error('[RTF] Error processing message:', err, data);
      }
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  // Handle form submission for text chat
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      // Create the user message
      const userMsg: LocalMessage = {
        id: generateId(),
        role: 'user',
        content: inputMessage,
        timestamp: Date.now(),
        final: true,
      };
      
      // Add to both local and global contexts
      setMessages(prev => [...prev, userMsg]);
      addMessage(userMsg.content, userMsg.role);
      
      // Send to the RTF server
      sendMessage(inputMessage);
      
      // Clear the input field
      setInputMessage('');
    }
  };

  // Handle voice connection
  const handleConnect = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [connect, disconnect, isConnected, voiceSelection]);

  if (error) {
    console.error('[RTF] Connection error:', error);
  }

  return (
    <div className="flex flex-col h-full w-full backdrop-blur-md bg-background/40 overflow-hidden relative">
      {/* Header */}
      {/* Absolute positioned close button */}
      <button
        onClick={() => disconnect()}
        className={cn(
          "absolute top-4 right-4 z-50 p-2 rounded-full shadow-md",
          isDark 
            ? "bg-white/20 hover:bg-white/30 text-white" 
            : "bg-black/20 hover:bg-black/30 text-black"
        )}
        aria-label="Close"
      >
        <XIcon className="w-5 h-5" />
      </button>
      
      <div className={cn(
        "flex items-center justify-between px-6 py-4 border-b",
        isDark ? "border-white/10 bg-black/20" : "border-black/5 bg-white/20"
      )}>
        {/* Connection status */}
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm",
            isConnected 
              ? "bg-green-500/10 text-green-500 border border-green-500/30" 
              : isConnecting 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                : "bg-gray-500/10 text-gray-500 border border-gray-500/30"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected 
                ? "bg-green-500" 
                : isConnecting 
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-gray-500"
            )} />
            <span>
              {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Ready'}
            </span>
          </div>
          {isListening && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium">
              <Mic className="w-3 h-3 animate-pulse" />
              <span>Listening</span>
            </div>
          )}
        </div>

        {/* Voice selector - moved to left side */}
        <div className="flex items-center gap-3">
          <div className="mr-12 relative"> {/* Added margin to avoid overlap with close button */}
            <select
              id="voiceSelect"
              value={voiceSelection}
              onChange={(e) => setVoiceSelection(e.target.value as VoiceOption)}
              disabled={isConnected}
              className={cn(
                "appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium",
                "border focus:outline-none focus:ring-1",
                isDark 
                  ? "bg-black/20 backdrop-blur-sm border-white/10 text-white/90 focus:ring-white/20" 
                  : "bg-white/20 backdrop-blur-sm border-black/5 text-gray-800 focus:ring-black/10",
                isConnected && "opacity-50 cursor-not-allowed"
              )}
            >
              <option value="alloy">Alloy</option>
              <option value="ash">Ash</option>
              <option value="ballad">Ballad</option>
              <option value="coral">Coral</option>
              <option value="echo">Echo</option>
              <option value="sage">Sage</option>
              <option value="shimmer">Shimmer</option>
              <option value="verse">Verse</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-6 space-y-3">
        {isConnected ? (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "p-4 rounded-xl max-w-[70%]",
                  message.role === 'user'
                    ? "ml-auto bg-black/20 backdrop-blur-sm text-white border border-white/10"
                    : message.role === 'system'
                      ? cn(
                          "border",
                          isDark
                            ? "bg-red-500/10 border-red-500/20 text-red-200"
                            : "bg-red-950/10 border-red-200/20 text-red-800"
                        )
                      : cn(
                          isDark
                            ? "bg-black/20 backdrop-blur-sm border border-white/10 text-white/90"
                            : "bg-white/60 backdrop-blur-sm border border-black/5 text-gray-800 shadow-sm"
                        )
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1.5",
                  message.role === 'user'
                    ? "text-white/80"
                    : message.role === 'system'
                      ? isDark ? "text-red-200/80" : "text-red-700/80"
                      : isDark ? "text-purple-300" : "text-purple-700"
                )}>
                  {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Floyd'}
                </div>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </motion.div>
            ))}
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl ml-auto max-w-[70%]",
                  isDark
                    ? "bg-black/20 backdrop-blur-sm border border-white/10 text-white/80"
                    : "bg-black/10 backdrop-blur-sm border border-black/5 text-white/90"
                )}
              >
                <div className="text-xs font-medium mb-1.5 text-white/80 flex items-center gap-1.5">
                  <span>You</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">typing...</span>
                </div>
                <div className="whitespace-pre-wrap text-sm">{currentTranscript}</div>
              </motion.div>
            )}
            <div ref={messageEndRef} />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleConnect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-full w-44 h-44 flex flex-col items-center justify-center gap-4",
                  "bg-black/20 backdrop-blur-md text-white shadow-lg",
                  "border",
                  isDark
                    ? "border-white/10"
                    : "border-black/5"
                )}
              >
                {isConnecting ? (
                  <LoaderIcon className="w-14 h-14 animate-spin" />
                ) : (
                  <Mic className="w-16 h-16" />
                )}
                <span className="text-xl font-medium">
                  {isConnecting ? 'Connecting…' : 'Start Chat'}
                </span>
              </motion.button>
              <p className={cn(
                "mt-6 text-center text-base",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                Click to start a voice conversation
              </p>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={cn(
        "px-6 py-4 border-t",
        isDark ? "border-white/10 bg-black/20" : "border-black/5 bg-white/20"
      )}>
        {isConnected ? (
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message and press Enter..."
              className={cn(
                "flex-1 px-5 py-3 rounded-lg text-base",
                "border focus:outline-none focus:ring-1 focus:ring-white/20",
                isDark 
                  ? "bg-black/20 backdrop-blur-sm border-white/10 text-white/90" 
                  : "bg-white/20 backdrop-blur-sm border-black/5 text-gray-800"
              )}
            />
            <motion.button
              type="submit"
              disabled={!inputMessage.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-5 py-3 rounded-lg text-base font-medium transition-all flex items-center gap-2 whitespace-nowrap",
                !inputMessage.trim()
                  ? isDark
                    ? "bg-white/[0.02] text-white/30 cursor-not-allowed"
                    : "bg-black/[0.02] text-black/30 cursor-not-allowed"
                  : isDark
                    ? "bg-black/30 backdrop-blur-sm border border-white/10 text-white/90 hover:bg-black/40"
                    : "bg-white/30 backdrop-blur-sm border border-black/5 text-gray-800 hover:bg-white/40"
              )}
            >
              <SendIcon className="w-3.5 h-3.5" />
              <span>Send</span>
            </motion.button>
          </form>
        ) : null }
      </div>
    </div>
  );
}
