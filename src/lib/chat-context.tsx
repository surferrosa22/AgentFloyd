'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { generateUniqueId } from './utils';
import type { ChatMessage } from './utils';
import { toggleVoiceOutput, toggleElevenLabsVoice } from '@/components/ui/chat-message';

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
  sendMessage: (content: string) => Promise<void>;
  enhancePrompt: (prompt: string) => Promise<string>;
  clearMessages: () => void;
  createNewChat: () => string;
  switchChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const createEmptyChat = (): Chat => ({
  id: generateUniqueId(),
  title: 'New Chat',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // All features are enabled by default
  const [isRealtimeEnabled] = useState(true);
  const [isVoiceEnabled] = useState(true);
  const [isElevenLabsEnabled] = useState(true);

  // Current chat's messages for convenience
  const messages = currentChatId 
    ? chats.find(chat => chat.id === currentChatId)?.messages || []
    : [];

  // Load chats from localStorage on client-side
  useEffect(() => {
    const storedChats = localStorage.getItem('floyd-chats');
    const storedCurrentChatId = localStorage.getItem('floyd-current-chat-id');
    
    // Enable voice and ElevenLabs by default
    toggleVoiceOutput(true);
    toggleElevenLabsVoice(true);
    
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        
        // Check if parsedChats is valid
        if (!Array.isArray(parsedChats) || parsedChats.length === 0) {
          // Invalid or empty chats, create a new one
          const newChat = createEmptyChat();
          setChats([newChat]);
          setCurrentChatId(newChat.id);
          return;
        }
        
        setChats(parsedChats);
        
        // Set current chat to the stored one or the most recent one
        if (storedCurrentChatId && parsedChats.some((chat: Chat) => chat.id === storedCurrentChatId)) {
          setCurrentChatId(storedCurrentChatId);
        } else if (parsedChats.length > 0) {
          // Current chat ID not found or invalid, pick the most recent
          const sortedChats = [...parsedChats].sort((a, b) => b.updatedAt - a.updatedAt);
          setCurrentChatId(sortedChats[0].id);
          // Update localStorage with the new current chat ID
          localStorage.setItem('floyd-current-chat-id', sortedChats[0].id);
        }
      } catch (error) {
        console.error('Error parsing stored chats:', error);
        // Error loading chats, create a new one
        const newChat = createEmptyChat();
        setChats([newChat]);
        setCurrentChatId(newChat.id);
      }
    } else {
      // Create a default chat if none exists
      const newChat = createEmptyChat();
      setChats([newChat]);
      setCurrentChatId(newChat.id);
    }
  }, []);

  // Audio streaming states
  const [isStreamingAudio, setIsStreamingAudio] = useState(false);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffers = useRef<AudioBuffer[]>([]);
  const isSpeaking = useRef<boolean>(false);
  
  // Initialize audio context on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContext.current = new AudioContext();
      }
    }
    
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);
  
  // Process audio queue
  useEffect(() => {
    if (!isStreamingAudio || audioQueue.length === 0 || !audioContext.current || isSpeaking.current) {
      return;
    }
    
    const playNextChunk = async () => {
      if (audioQueue.length === 0) {
        return;
      }
      
      try {
        isSpeaking.current = true;
        const base64Audio = audioQueue[0];
        
        // Convert base64 to ArrayBuffer
        const binaryString = window.atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Decode audio data
        const audioBuffer = await audioContext.current.decodeAudioData(bytes.buffer);
        
        // Create and connect source
        const source = audioContext.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.current.destination);
        
        // Play the audio
        source.start(0);
        
        // When finished, remove from queue and play next
        source.onended = () => {
          setAudioQueue(prev => prev.slice(1));
          isSpeaking.current = false;
        };
      } catch (error) {
        console.error('Error playing audio chunk:', error);
        setAudioQueue(prev => prev.slice(1));
        isSpeaking.current = false;
      }
    };
    
    playNextChunk();
  }, [audioQueue, isStreamingAudio]);

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system') => {
    if (!currentChatId) return null;
    
    const newMessage: ChatMessage = {
      id: generateUniqueId(),
      role,
      content,
      timestamp: Date.now(),
    };

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === currentChatId) {
          // Update chat with new message and update the timestamp
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            updatedAt: Date.now(),
            // Update title based on first user message if it's still the default
            title: chat.title === 'New Chat' && role === 'user' 
              ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
              : chat.title
          };
        }
        return chat;
      });
    });

    return newMessage;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return;

    // Add user message
    addMessage(content, 'user');

    // Set typing state to show the assistant is responding
    setIsTyping(true);

    try {
      // Get current chat messages
      const currentChat = chats.find(chat => chat.id === currentChatId);
      
      // If chat not found, create a new one instead of throwing an error
      if (!currentChat) {
        console.warn('Current chat not found, creating a new one');
        // Create a new chat and update state directly to ensure it exists
        const newChat = createEmptyChat();
        const newChatId = newChat.id;
        
        // Update chats directly for immediate effect
        const updatedChats = [...chats, newChat];
        setChats(updatedChats);
        localStorage.setItem('floyd-chats', JSON.stringify(updatedChats));
        
        // Set as current chat
        setCurrentChatId(newChatId);
        localStorage.setItem('floyd-current-chat-id', newChatId);
        
        // Add the user message to the new chat directly
        const userMessage = {
          id: generateUniqueId(),
          role: 'user' as const,
          content,
          timestamp: Date.now()
        };
        
        newChat.messages.push(userMessage);
        setChats(updatedChats);
        localStorage.setItem('floyd-chats', JSON.stringify(updatedChats));
        
        // Format messages for the API with just the current message
        const apiMessages = [{
          role: 'user',
          content
        }];
        
        // Create placeholder for streaming response
        const placeholderMessage = addMessage('', 'assistant');
        
        // Skip if unable to create placeholder message
        if (!placeholderMessage) {
          console.error('Failed to create placeholder message');
          return;
        }

        const placeholderMessageId = placeholderMessage.id;
        
        // Update the placeholder message to mark it as streaming
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === newChatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === placeholderMessageId 
                    ? { ...msg, isGenerating: true } 
                    : msg
                )
              };
            }
            return chat;
          });
        });
        
        setIsTyping(false);

        // Use streaming by default
        const eventSource = new EventSource(`/api/chat/stream?t=${Date.now()}`);
        
        // Setup event handlers for SSE
        eventSource.onopen = () => {
          console.log('SSE connection opened');
          // Send the initial message once the connection is established
          fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
          }).catch(error => {
            console.error('Error sending initial SSE message:', error);
            eventSource.close();
          });
        };
        
        let responseText = '';
        
        eventSource.onmessage = (event) => {
          if (event.data === '[DONE]') {
            eventSource.close();
            // Mark the message as complete
            setChats(prevChats => {
              return prevChats.map(chat => {
                if (chat.id === newChatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === placeholderMessageId
                        ? { ...msg, isGenerating: false } 
                        : msg
                    )
                  };
                }
                return chat;
              });
            });
            return;
          }
          
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              console.error('SSE error:', data.error);
              eventSource.close();
              return;
            }
            
            if (data.chunk) {
              responseText += data.chunk;
              // Update message with the latest chunk
              setChats(prevChats => {
                return prevChats.map(chat => {
                  if (chat.id === newChatId) {
                    return {
                      ...chat,
                      messages: chat.messages.map(msg => 
                        msg.id === placeholderMessageId
                          ? { ...msg, content: responseText, isGenerating: true } 
                        : msg
                      ),
                      updatedAt: Date.now()
                    };
                  }
                  return chat;
                });
              });
              
              // Emit event for scrolling
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('floyd-message-updated', {
                  detail: { messageId: placeholderMessageId }
                }));
              }
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error, event.data);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
          // Mark message as complete in case of error
          setChats(prevChats => {
            return prevChats.map(chat => {
              if (chat.id === newChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === placeholderMessageId
                      ? { ...msg, isGenerating: false } 
                      : msg
                  )
                };
              }
              return chat;
            });
          });
        };

        // Add audio streaming by default
        setIsStreamingAudio(true);
        setAudioQueue([]); // Clear any existing audio queue
        
        // Set up audio event listener
        const audioEventListener = (event: MessageEvent) => {
          if (event.data === '[DONE]') {
            setIsStreamingAudio(false);
            return;
          }
          
          try {
            const data = JSON.parse(event.data);
            if (data.audio) {
              // Add audio chunk to queue
              setAudioQueue(prev => [...prev, data.audio]);
            }
          } catch (error) {
            console.error('Error parsing audio event data:', error);
          }
        };
        
        // Create a separate EventSource for audio streaming
        const audioEventSource = new EventSource(`/api/tts/stream?t=${Date.now()}`);
        audioEventSource.addEventListener('message', audioEventListener);
        
        // Clean up function
        const cleanupAudioStream = () => {
          audioEventSource.removeEventListener('message', audioEventListener);
          audioEventSource.close();
          setIsStreamingAudio(false);
        };
        
        // Set up error handler
        audioEventSource.onerror = () => {
          console.error('Audio stream error');
          cleanupAudioStream();
        };
        
        // Send the streamed text to the audio API as it's generated
        let textToSpeak = '';
        
        const originalTextListener = eventSource.onmessage;
        eventSource.onmessage = (event) => {
          // Call the original listener first
          if (originalTextListener) {
            originalTextListener.call(eventSource, event);
          }
          
          // Process for audio streaming
          if (event.data === '[DONE]') {
            // Send any remaining text for speech
            if (textToSpeak.trim()) {
              fetch('/api/tts/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: textToSpeak,
                  // Add voice options if needed
                }),
              }).catch(error => {
                console.error('Error sending final text chunk for TTS:', error);
              });
              textToSpeak = '';
            }
            
            // Clean up audio stream after a delay to allow final chunks to process
            setTimeout(cleanupAudioStream, 1000);
            return;
          }
          
          try {
            const data = JSON.parse(event.data);
            if (data.chunk) {
              textToSpeak += data.chunk;
              
              // Send text for TTS when we have enough to speak
              // This prevents many tiny audio chunks and makes speech more natural
              if (textToSpeak.length >= 50 || textToSpeak.includes('.') || textToSpeak.includes('!') || textToSpeak.includes('?')) {
                fetch('/api/tts/stream', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    text: textToSpeak,
                    // Add voice options if needed
                  }),
                }).catch(error => {
                  console.error('Error sending text chunk for TTS:', error);
                });
                
                textToSpeak = '';
              }
            }
          } catch (error) {
            console.error('Error processing text for audio stream:', error);
          }
        };
        
        return;
      }

      // Format messages for the API
      const apiMessages = currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      apiMessages.push({ role: 'user', content });

      // Create a placeholder message for the assistant's response with isGenerating flag
      const placeholderMessage = addMessage('', 'assistant');
      
      // Skip if unable to create placeholder message
      if (!placeholderMessage) {
        console.error('Failed to create placeholder message');
        return;
      }

      const placeholderMessageId = placeholderMessage.id;
      
      // Update the placeholder message to mark it as generating
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === placeholderMessageId
                  ? { ...msg, isGenerating: true } 
                  : msg
              )
            };
          }
          return chat;
        });
      });
      
      // Set isTyping to false once we've created a message with isGenerating=true
      // This avoids having both indicators active at the same time
      setIsTyping(false);

      // Use streaming by default
      const eventSource = new EventSource(`/api/chat/stream?t=${Date.now()}`);
      
      // Setup event handlers for SSE
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        // Send the initial message once the connection is established
        fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        }).catch(error => {
          console.error('Error sending initial SSE message:', error);
          eventSource.close();
        });
      };
      
      let responseText = '';
      
      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close();
          // Mark the message as complete
          setChats(prevChats => {
            console.log('Finished streaming: setting isGenerating=false');
            return prevChats.map(chat => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === placeholderMessageId
                      ? { ...msg, isGenerating: false } 
                      : msg
                  )
                };
              }
              return chat;
            });
          });
          
          // Emit custom event when generation has finished
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('floyd-message-completed', {
              detail: { messageId: placeholderMessageId }
            }));
          }
          return;
        }
        
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            console.error('SSE error:', data.error);
            eventSource.close();
            return;
          }
          
          if (data.chunk) {
            responseText += data.chunk;
            // Update message with the latest chunk
            setChats(prevChats => {
              return prevChats.map(chat => {
                if (chat.id === currentChatId) {
                  return {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === placeholderMessageId
                        ? { ...msg, content: responseText, isGenerating: true } 
                        : msg
                    ),
                    updatedAt: Date.now()
                  };
                }
                return chat;
              });
            });
            
            // Emit event for scrolling
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('floyd-message-updated', {
                detail: { messageId: placeholderMessageId }
              }));
            }
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error, event.data);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        // Mark message as complete in case of error
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === placeholderMessageId
                    ? { ...msg, isGenerating: false } 
                    : msg
                )
              };
            }
            return chat;
          });
        });
      };

      // Add audio streaming by default
      setIsStreamingAudio(true);
      setAudioQueue([]); // Clear any existing audio queue
      
      // Set up audio event listener
      const audioEventListener = (event: MessageEvent) => {
        if (event.data === '[DONE]') {
          setIsStreamingAudio(false);
          return;
        }
        
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            // Add audio chunk to queue
            setAudioQueue(prev => [...prev, data.audio]);
          }
        } catch (error) {
          console.error('Error parsing audio event data:', error);
        }
      };
      
      // Create a separate EventSource for audio streaming
      const audioEventSource = new EventSource(`/api/tts/stream?t=${Date.now()}`);
      audioEventSource.addEventListener('message', audioEventListener);
      
      // Clean up function
      const cleanupAudioStream = () => {
        audioEventSource.removeEventListener('message', audioEventListener);
        audioEventSource.close();
        setIsStreamingAudio(false);
      };
      
      // Set up error handler
      audioEventSource.onerror = () => {
        console.error('Audio stream error');
        cleanupAudioStream();
      };
      
      // Send the streamed text to the audio API as it's generated
      let textToSpeak = '';
      
      const originalTextListener = eventSource.onmessage;
      eventSource.onmessage = (event) => {
        // Call the original listener first
        if (originalTextListener) {
          originalTextListener.call(eventSource, event);
        }
        
        // Process for audio streaming
        if (event.data === '[DONE]') {
          // Send any remaining text for speech
          if (textToSpeak.trim()) {
            fetch('/api/tts/stream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: textToSpeak,
                // Add voice options if needed
              }),
            }).catch(error => {
              console.error('Error sending final text chunk for TTS:', error);
            });
            textToSpeak = '';
          }
          
          // Clean up audio stream after a delay to allow final chunks to process
          setTimeout(cleanupAudioStream, 1000);
          return;
        }
        
        try {
          const data = JSON.parse(event.data);
          if (data.chunk) {
            textToSpeak += data.chunk;
            
            // Send text for TTS when we have enough to speak
            // This prevents many tiny audio chunks and makes speech more natural
            if (textToSpeak.length >= 50 || textToSpeak.includes('.') || textToSpeak.includes('!') || textToSpeak.includes('?')) {
              fetch('/api/tts/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: textToSpeak,
                  // Add voice options if needed
                }),
              }).catch(error => {
                console.error('Error sending text chunk for TTS:', error);
              });
              
              textToSpeak = '';
            }
          }
        } catch (error) {
          console.error('Error processing text for audio stream:', error);
        }
      };
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error while processing your request.', 'assistant');
    } finally {
      // Keep typing indicator visible until generation effect completes
      setTimeout(() => {
        setIsTyping(false);
      }, 500); // Short delay to let typewriter finish
    }
  };

  const enhancePrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return prompt;

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      return data.enhancedPrompt;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      return prompt;
    }
  };

  const clearMessages = () => {
    if (currentChatId) {
      const newChat = createEmptyChat();
      setChats(prevChats => [...prevChats, newChat]);
      setCurrentChatId(newChat.id);
    }
  };

  const createNewChat = () => {
    const newChat = createEmptyChat();
    
    // Fix synchronization issue by using a more reliable approach
    try {
      // First update the state with new chat
      setChats(prevChats => [...prevChats, newChat]);
      
      // Wait for state update to complete in next render cycle
      setTimeout(() => {
        // Double-check that the chat was added and update localStorage
        const storedChats = JSON.parse(localStorage.getItem('floyd-chats') || '[]');
        if (!storedChats.some((chat: Chat) => chat.id === newChat.id)) {
          // If chat wasn't stored properly, try again
          const updatedChats = [...storedChats, newChat];
          localStorage.setItem('floyd-chats', JSON.stringify(updatedChats));
          console.log('Chat creation retry successful');
        }
      }, 50);
      
      // Set current chat ID
      setCurrentChatId(newChat.id);
      localStorage.setItem('floyd-current-chat-id', newChat.id);
      
      return newChat.id;
    } catch (error) {
      // Fallback error handling to ensure we don't crash
      console.error('Error creating new chat:', error);
      
      // Create a fallback chat as last resort
      const fallbackChat = createEmptyChat();
      const currentChats = JSON.parse(localStorage.getItem('floyd-chats') || '[]');
      const updatedChats = [...currentChats, fallbackChat];
      localStorage.setItem('floyd-chats', JSON.stringify(updatedChats));
      setChats(updatedChats);
      setCurrentChatId(fallbackChat.id);
      localStorage.setItem('floyd-current-chat-id', fallbackChat.id);
      
      return fallbackChat.id;
    }
  };

  const switchChat = (chatId: string) => {
    if (chats.some(chat => chat.id === chatId)) {
      setCurrentChatId(chatId);
    }
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    setChats(prevChats => {
      const filteredChats = prevChats.filter(chat => chat.id !== chatId);
      
      // If we're deleting the current chat, switch to another one
      if (currentChatId === chatId && filteredChats.length > 0) {
        const sortedChats = [...filteredChats].sort((a, b) => b.updatedAt - a.updatedAt);
        setCurrentChatId(sortedChats[0].id);
      } else if (filteredChats.length === 0) {
        // If no chats left, create a new one
        const newChat = createEmptyChat();
        setCurrentChatId(newChat.id);
        return [newChat];
      }
      
      return filteredChats;
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        messages,
        isTyping,
        addMessage,
        sendMessage,
        enhancePrompt,
        clearMessages,
        createNewChat,
        switchChat,
        updateChatTitle,
        deleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}