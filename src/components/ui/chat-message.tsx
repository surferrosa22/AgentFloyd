'use client';

import { motion } from 'framer-motion';
import { formatTimestamp } from '@/lib/utils';
import { CircleUserRound, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isUser = message.role === 'user';
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Set the content immediately instead of using typewriter effect
  const [displayedContent, setDisplayedContent] = useState(message.content);
  const [cursorVisible, setCursorVisible] = useState(false);
  const contentRef = useRef(message.content);
  const isGenerating = message.isGenerating && !isUser;
  
  // Debug log when message is generating
  useEffect(() => {
    if (isGenerating) {
      console.log('Message is in generating state:', message.id);
    }
  }, [isGenerating, message.id]);
  
  // Scroll into view when content updates
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayedContent, isGenerating]);
  
  // Reset displayed content if message content changes
  useEffect(() => {
    contentRef.current = message.content;
    setDisplayedContent(message.content);
    setCursorVisible(false);
  }, [message.content]);

  // Add custom scrollbar styles
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('custom-scrollbar-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-scrollbar-styles';
      style.innerHTML = `
        .custom-scrollbar-dark::-webkit-scrollbar,
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-track,
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <motion.div
      className={cn(
        "flex gap-3 p-4 w-full max-w-3xl mx-auto",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex gap-3 items-start",
        isUser ? "flex-row-reverse" : "flex-row",
        isUser ? "max-w-[80%]" : "max-w-[90%]"
      )}>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser 
            ? isDark 
              ? "bg-white/10 ring-1 ring-white/20" 
              : "bg-black/5 ring-1 ring-black/10"
            : isDark 
              ? "bg-violet-500/20 ring-1 ring-violet-500/30" 
              : "bg-violet-50 ring-1 ring-violet-200"
        )}>
          {isUser ? (
            <CircleUserRound className={cn(
              "w-5 h-5",
              isDark ? "text-white/70" : "text-black/70"
            )} />
          ) : (
            <Sparkles className={cn(
              "w-4 h-4",
              isDark ? "text-violet-300" : "text-violet-600",
              // Add pulsing animation when generating
              isGenerating ? "animate-pulse" : ""
            )} />
          )}
        </div>
        
        <div className={cn(
          "flex flex-col space-y-1",
          isUser ? "items-end" : "items-start",
          "w-full"
        )}>
          <div className={cn(
            "px-5 py-3 rounded-xl text-sm",
            isUser 
              ? isDark 
                ? "bg-white/90 text-black shadow-lg shadow-white/5"
                : "bg-black text-white shadow-lg shadow-black/10"
              : isDark
                ? "bg-white/[0.03] border border-white/[0.05] text-white/90 backdrop-blur-sm"
                : "bg-white text-black/90 border border-black/5 shadow-sm backdrop-blur-sm",
            // Add subtle glow when generating
            isGenerating ? isDark ? "ring-1 ring-violet-500/30" : "ring-1 ring-violet-500/20" : "",
            "max-w-full overflow-hidden"
          )}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{displayedContent}</div>
            ) : (
              <div className={cn(
                "prose prose-sm dark:prose-invert max-w-none overflow-auto pr-1",
                isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light"
              )}>
                <ReactMarkdown 
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className={cn(
                        "overflow-auto rounded-md my-2 p-2",
                        isDark ? "bg-black/20 dark:bg-white/5 custom-scrollbar-dark" : "bg-black/10 custom-scrollbar-light",
                        "max-h-[400px]" // Limit max height of code blocks
                      )}>
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, inline, ...props }) => (
                      inline 
                        ? <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded" {...props} />
                        : <code {...props} />
                    )
                  }}
                >{displayedContent}</ReactMarkdown>
                <div ref={messageEndRef} className="h-0 w-full" />
              </div>
            )}
          </div>
          <span className={cn(
            "text-[10px] px-2",
            isUser ? "text-right" : "text-left",
            isDark ? "text-white/40" : "text-black/40"
          )}>
            {formatTimestamp(message.timestamp)}
            {/* Show "writing..." in the timestamp area when generating */}
            {isGenerating && (
              <span className="ml-2 text-violet-400 animate-pulse">writing...</span>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}