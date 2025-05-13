'use client';

import { useState, useRef, useEffect } from 'react';
import { cn, formatTimestamp } from '@/lib/utils';
import type { ChatMessage } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { Sparkles, CircleUserRound } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import * as RdxHoverCard from "@radix-ui/react-hover-card";
import { useChat } from '@/lib/chat-context';

interface ChatMessageProps {
  message: ChatMessage;
}

// Custom processor function to handle special link formats like "link: YouTube"
function processContent(content: string): string {
  // Handle the exact pattern from the screenshot: "clicking on this link: YouTube"
  let processed = content.replace(
    /clicking on this link: (YouTube|youtube|Google|github|twitter|facebook)/g, 
    (match, site) => {
      return `clicking on this link: [${site}](https://${site.toLowerCase()}.com)`;
    }
  );
  
  // Handle general "link: YouTube" format
  processed = processed.replace(
    /\b(link:\s+)(YouTube|youtube|Google|github|twitter|facebook)\b/g, 
    (_, prefix, site) => {
      return `${prefix}[${site}](https://${site.toLowerCase()}.com)`;
    }
  );
  
  return processed;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isUser = message.role === 'user';
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { isContinuousListening } = useChat();

  // Process content to handle special link formats
  const processedContent = isUser ? message.content : processContent(message.content);

  // Set the content immediately instead of using typewriter effect
  const [displayedContent, setDisplayedContent] = useState(processedContent);
  const contentRef = useRef(processedContent);
  const isGenerating = message.isGenerating && !isUser;
  
  // Debug log when message is generating
  useEffect(() => {
    if (isGenerating) {
      console.log('Message is in generating state:', message.id);
    }
  }, [isGenerating, message.id]);
  
  // Don't attempt to scroll individual messages - let the parent component handle it
  // Just dispatch events when content changes
  useEffect(() => {
    if (message.content && !isUser) {
      // Only notify parent component about content updates
      window.dispatchEvent(new CustomEvent('floyd-message-updated', {
        detail: { messageId: message.id }
      }));
    }
  }, [message.content, message.id, isUser]);
  
  // Reset displayed content if message content changes
  useEffect(() => {
    contentRef.current = isUser ? message.content : processContent(message.content);
    setDisplayedContent(contentRef.current);

    // When generation completes, notify parent
    if (!isGenerating && message.content && !isUser) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('floyd-message-completed', {
          detail: { messageId: message.id }
        }));
      }, 50);
    }
  }, [message.content, isGenerating, isUser, message.id]);

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
      data-message-role={message.role}
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
                isDark ? "custom-scrollbar-dark" : "custom-scrollbar-light",
                // Add custom link styles to ensure all links are visible
                "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
              )}>
                <ReactMarkdown 
                  remarkPlugins={[
                    // Add a plugin to detect plain text URLs and turn them into links
                    [() => (tree) => {
                      try {
                        const { visit } = require('unist-util-visit');
                        
                        // URL regex pattern
                        const urlPattern = /https?:\/\/[^\s)]+/g;
                        
                        // Visit all text nodes and replace URLs with link nodes
                        visit(tree, 'text', (node, index, parent) => {
                          if (!parent || parent.type === 'link') return;
                          
                          const matches = node.value.match(urlPattern);
                          if (!matches) return;
                          
                          const parts = [];
                          let lastIndex = 0;
                          
                          matches.forEach(match => {
                            const matchIndex = node.value.indexOf(match, lastIndex);
                            
                            // Add text before the URL
                            if (matchIndex > lastIndex) {
                              parts.push({
                                type: 'text',
                                value: node.value.slice(lastIndex, matchIndex)
                              });
                            }
                            
                            // Add the URL as a link
                            parts.push({
                              type: 'link',
                              url: match,
                              children: [{ type: 'text', value: match }]
                            });
                            
                            lastIndex = matchIndex + match.length;
                          });
                          
                          // Add remaining text
                          if (lastIndex < node.value.length) {
                            parts.push({
                              type: 'text',
                              value: node.value.slice(lastIndex)
                            });
                          }
                          
                          parent.children.splice(index, 1, ...parts);
                          return [visit.SKIP, index + parts.length];
                        });
                      } catch (e) {
                        console.error("Error in URL detection plugin:", e);
                      }
                    }]
                  ]}
                  components={{
                    a: ({ node, href, children, ...props }) => {
                      // Handle cases where href might be undefined
                      let linkUrl = href || '';
                      
                      // Extract domain for favicon
                      let domain = "";
                      try {
                        if (linkUrl.startsWith('http')) {
                          const url = new URL(linkUrl);
                          domain = url.hostname;
                        } else if (linkUrl === 'YouTube' || 
                                  linkUrl.toLowerCase() === 'youtube' || 
                                  linkUrl.includes('youtube.com') ||
                                  linkUrl.includes('youtu.be')) {
                          // Special handling for YouTube links
                          domain = 'youtube.com';
                          // Fix the URL format for YouTube links
                          if (!linkUrl.startsWith('http')) {
                            linkUrl = 'https://youtube.com';
                          }
                        }
                      } catch (e) {
                        // If URL parsing fails, just use the href as is
                      }
                      
                      // Get favicon URL if we have a domain
                      const faviconUrl = domain ? 
                        `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
                      
                      // Final URL to use - default to youtube.com for YouTube text
                      const finalUrl = linkUrl === 'YouTube' || linkUrl.toLowerCase() === 'youtube' 
                        ? 'https://youtube.com' 
                        : linkUrl;
                      
                      return (
                        <RdxHoverCard.Root openDelay={75} closeDelay={150}>
                          <RdxHoverCard.Trigger asChild>
                            <a 
                              href={finalUrl} 
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            >
                              {children}
                            </a>
                          </RdxHoverCard.Trigger>
                          <RdxHoverCard.Portal>
                            <RdxHoverCard.Content 
                              className={cn(
                                "z-50 p-4 backdrop-blur-xl rounded-lg shadow-lg",
                                "w-[350px] max-w-[90vw]", // Responsive width
                                isDark 
                                  ? "bg-gray-900/90 border border-gray-700/50" 
                                  : "bg-white/95 border border-gray-200/80"
                              )}
                              side="top" 
                              align="center"
                              sideOffset={12}
                              avoidCollisions
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {faviconUrl && (
                                      <div className={cn(
                                        "w-6 h-6 flex-shrink-0 flex items-center justify-center rounded",
                                        isDark ? "bg-gray-800" : "bg-gray-100"
                                      )}>
                                        <img 
                                          src={faviconUrl} 
                                          alt=""
                                          className="w-4 h-4"
                                          width={16}
                                          height={16}
                                        />
                                      </div>
                                    )}
                                    <h3 className={cn(
                                      "font-semibold text-sm truncate flex-1",
                                      isDark ? "text-white/90" : "text-gray-800"
                                    )}>
                                      {domain || finalUrl}
                                    </h3>
                                  </div>
                                  <p className={cn(
                                    "text-xs truncate border-t pt-2 mt-1",
                                    isDark ? "text-gray-400/90 border-gray-700/50" : "text-gray-500 border-gray-200"
                                  )}>
                                    {finalUrl}
                                  </p>
                                  <div className={cn(
                                    "text-xs flex items-center gap-1.5 pt-1",
                                    isDark ? "text-blue-300/80" : "text-blue-600/80"
                                  )}>
                                    <span className={cn(
                                      "w-2 h-2 rounded-full animate-pulse",
                                      isDark ? "bg-blue-400/80" : "bg-blue-500/80"
                                    )} />
                                    <span>Open in new tab</span>
                                  </div>
                                </div>
                              </motion.div>
                            </RdxHoverCard.Content>
                          </RdxHoverCard.Portal>
                        </RdxHoverCard.Root>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <div className={cn(
                        "overflow-auto rounded-md my-2 p-2",
                        isDark ? "bg-black/20 dark:bg-white/5 custom-scrollbar-dark" : "bg-black/10 custom-scrollbar-light",
                        "max-h-[400px]" // Limit max height of code blocks
                      )}>
                        <pre {...props} />
                      </div>
                    ),
                    // Use a simpler approach for code blocks
                    code: ({ className, children, ...props }) => {
                      // If it has a language class, it's a code block, not inline
                      const match = /language-(\w+)/.exec(className || '');
                      return !match ? (
                        <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >{displayedContent}</ReactMarkdown>
                {/* Mark point for visibility tracking */}
                <div ref={messageEndRef} className="h-0 w-full" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-[10px] px-2",
              isUser ? "text-right" : "text-left",
              isDark ? "text-white/40" : "text-black/40"
            )}>
              {formatTimestamp(message.timestamp)}
              {/* Replace "writing..." text with a subtle loading animation */}
              {isGenerating && (
                <span className="ml-2 inline-flex">
                  <motion.span
                    className={cn(
                      "h-1 w-1 rounded-full mx-0.5",
                      isDark ? "bg-violet-400" : "bg-violet-600"
                    )}
                    animate={{
                      opacity: [0.3, 0.9, 0.3],
                      scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.span
                    className={cn(
                      "h-1 w-1 rounded-full mx-0.5",
                      isDark ? "bg-violet-400" : "bg-violet-600"
                    )}
                    animate={{
                      opacity: [0.3, 0.9, 0.3],
                      scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.2,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.span
                    className={cn(
                      "h-1 w-1 rounded-full mx-0.5",
                      isDark ? "bg-violet-400" : "bg-violet-600"
                    )}
                    animate={{
                      opacity: [0.3, 0.9, 0.3],
                      scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.4,
                      ease: "easeInOut"
                    }}
                  />
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}