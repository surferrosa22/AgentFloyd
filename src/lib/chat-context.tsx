'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, generateUniqueId } from './utils';

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

  // Current chat's messages for convenience
  const messages = currentChatId 
    ? chats.find(chat => chat.id === currentChatId)?.messages || []
    : [];

  // Load chats from localStorage on client-side
  useEffect(() => {
    const storedChats = localStorage.getItem('floyd-chats');
    const storedCurrentChatId = localStorage.getItem('floyd-current-chat-id');
    
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

  // Save chats to localStorage when they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('floyd-chats', JSON.stringify(chats));
    }
    if (currentChatId) {
      localStorage.setItem('floyd-current-chat-id', currentChatId);
    }
  }, [chats, currentChatId]);

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
        
        // Continue with API call
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from API');
        }

        const data = await response.json();
        const assistantResponse = data.response.content;

        // Add assistant response to the new chat
        addMessage(assistantResponse, 'assistant');
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
      const placeholderMessageId = addMessage('', 'assistant');
      
      // Update the placeholder message to mark it as generating
      if (placeholderMessageId) {
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === placeholderMessageId.id 
                    ? { ...msg, isGenerating: true } 
                    : msg
                )
              };
            }
            return chat;
          });
        });
      }

      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      const assistantResponse = data.response.content;

      // Update the placeholder with the real content, keeping isGenerating true
      if (placeholderMessageId) {
        setChats(prevChats => {
          // Add debug log for setting isGenerating
          console.log('Setting message content with isGenerating=true');
          return prevChats.map(chat => {
            if (chat.id === currentChatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === placeholderMessageId.id 
                    ? { ...msg, content: assistantResponse, isGenerating: true } 
                    : msg
                ),
                updatedAt: Date.now()
              };
            }
            return chat;
          });
        });
        
        // Simulate the message being finished generating after a brief delay
        // This gives time for the typewriter effect to be visible
        setTimeout(() => {
          setChats(prevChats => {
            // Add debug log for when isGenerating is set to false
            console.log('Finished generating: setting isGenerating=false');
            return prevChats.map(chat => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === placeholderMessageId.id 
                      ? { ...msg, isGenerating: false } 
                      : msg
                  )
                };
              }
              return chat;
            });
          });
        }, Math.min(3000, assistantResponse.length * 15)); // Cap at 3 seconds or proportional to length
      }
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