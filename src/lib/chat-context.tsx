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
        setChats(parsedChats);
        
        // Set current chat to the stored one or the most recent one
        if (storedCurrentChatId && parsedChats.some((chat: Chat) => chat.id === storedCurrentChatId)) {
          setCurrentChatId(storedCurrentChatId);
        } else if (parsedChats.length > 0) {
          // Sort by updatedAt and pick the most recent
          const sortedChats = [...parsedChats].sort((a, b) => b.updatedAt - a.updatedAt);
          setCurrentChatId(sortedChats[0].id);
        }
      } catch (error) {
        console.error('Error parsing stored chats:', error);
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
      if (!currentChat) throw new Error('Current chat not found');

      // Format messages for the API
      const apiMessages = currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      apiMessages.push({ role: 'user', content });

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

      // Add assistant response
      addMessage(assistantResponse, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, I encountered an error while processing your request.', 'assistant');
    } finally {
      setIsTyping(false);
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
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
    return newChat.id;
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