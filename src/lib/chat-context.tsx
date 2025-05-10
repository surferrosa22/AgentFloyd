'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, generateUniqueId } from './utils';

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
  sendMessage: (content: string) => Promise<void>;
  enhancePrompt: (prompt: string) => Promise<string>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from localStorage on client-side
  useEffect(() => {
    const storedMessages = localStorage.getItem('floyd-chat-messages');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('floyd-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system') => {
    const newMessage: ChatMessage = {
      id: generateUniqueId(),
      role,
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage(content, 'user');

    // Set typing state to show the assistant is responding
    setIsTyping(true);

    try {
      // Format messages for the API
      const apiMessages = messages.map(msg => ({
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
    setMessages([]);
    localStorage.removeItem('floyd-chat-messages');
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isTyping,
        addMessage,
        sendMessage,
        enhancePrompt,
        clearMessages,
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