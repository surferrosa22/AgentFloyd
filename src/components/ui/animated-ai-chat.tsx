"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    PlusCircle,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

import { useChat } from '@/lib/chat-context';
import { ChatMessageComponent } from './chat-message';
import { useTheme } from '@/components/theme-provider';
import { ChatInputWrapper, ChatPlaceholder } from './chat-input-wrapper';
import { ChatInput } from './chat-input';
import { RealtimeChatFixed } from '@/components/RealtimeChatFixed';

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Make sure we retain scroll position when adjusting height
            const scrollTop = textarea.scrollTop;
            
            // Set height to minHeight first to properly calculate scrollHeight
            textarea.style.height = `${minHeight}px`;
            
            // Limit height to maxHeight and enable scrolling beyond that
            const newHeight = Math.min(
                Math.max(minHeight, textarea.scrollHeight),
                maxHeight ?? Number.POSITIVE_INFINITY
            );

            textarea.style.height = `${newHeight}px`;
            
            // If content is larger than maxHeight, enable internal scrolling
            if (maxHeight && textarea.scrollHeight > maxHeight) {
                textarea.style.overflowY = 'auto';
                
                // Add styling for scrollbar to match site's design
                if (typeof document !== 'undefined') {
                    // Add a custom class to style the scrollbar
                    textarea.classList.add('custom-scrollbar');
                }
            } else {
                textarea.style.overflowY = 'hidden';
                
                if (typeof document !== 'undefined') {
                    textarea.classList.remove('custom-scrollbar');
                }
            }
            
            // Restore scroll position after height adjustment
            textarea.scrollTop = scrollTop;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

interface AnimatedAIChatProps {
  voiceModalOpen?: boolean;
  setVoiceModalOpen?: (open: boolean) => void;
}

export function AnimatedAIChat({ voiceModalOpen, setVoiceModalOpen }: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 40,
        maxHeight: 120,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [internalVoiceModal, setInternalVoiceModal] = useState(false);
    const voiceModal = typeof voiceModalOpen === 'boolean' ? voiceModalOpen : internalVoiceModal;
    const setVoiceModal = setVoiceModalOpen || setInternalVoiceModal;
    
    // Use theme context
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    // Use the chat context for AI functionality
    const { 
        messages, 
        isTyping, 
        sendMessage, 
        enhancePrompt: enhancePromptAPI, 
        createNewChat,
        currentChatId
    } = useChat();

    // Helper to check if there are any generating messages
    const hasGeneratingMessage = messages.some(msg => msg.isGenerating);
    const lastMessageIsFromAI = messages.length > 0 && messages[messages.length - 1].role === 'assistant';

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <ImageIcon className="w-4 h-4" />, 
            label: "Clone UI", 
            description: "Generate a UI from a screenshot", 
            prefix: "/clone" 
        },
        { 
            icon: <Figma className="w-4 h-4" />, 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: <MonitorIcon className="w-4 h-4" />, 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(`${selectedCommand.prefix} `);
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    // Add a debounce function with useCallback to ensure stability
    const debounce = useCallback(<T extends (...args: unknown[]) => void>(func: T, wait: number) => {
        let timeout: NodeJS.Timeout | null = null;
        return (...args: Parameters<T>) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }, []);
        
    // Add a single scroll operation controller to prevent multiple, competing scroll operations
    // This ensures only one scroll operation happens at a time
    const scrollOpRef = useRef<{timeoutId: NodeJS.Timeout | null, isScrolling: boolean}>({
        timeoutId: null,
        isScrolling: false
    });

    // Enhanced scrollToBottom with improved reliability and proper throttling
    const scrollToBottom = useCallback((smooth = false) => {
        if (!messagesContainerRef.current || scrollOpRef.current.isScrolling) return;
        
        // Mark that a scroll operation is in progress
        scrollOpRef.current.isScrolling = true;
        
        // Clear any existing timeout
        if (scrollOpRef.current.timeoutId) {
            clearTimeout(scrollOpRef.current.timeoutId);
        }
        
        // Get container measurements
        const container = messagesContainerRef.current;
        
        // Use direct DOM manipulation for smoother scrolling
        container.scrollTop = container.scrollHeight;
        
        // Set a timeout to allow further scroll operations after a delay
        scrollOpRef.current.timeoutId = setTimeout(() => {
            scrollOpRef.current.isScrolling = false;
        }, 300); // Prevent new scroll operations for 300ms
    }, []);

    // Use a single function to handle all scroll triggers
    const handleScrollTrigger = useCallback(() => {
        if (isAutoScrollEnabled && !scrollOpRef.current.isScrolling) {
            scrollToBottom();
        }
    }, [isAutoScrollEnabled, scrollToBottom]);

    // Simplified autoscroll for message updates - use a single handler
    useEffect(() => {
        window.addEventListener('floyd-message-updated', handleScrollTrigger);
        window.addEventListener('floyd-message-completed', handleScrollTrigger);
        window.addEventListener('message-scrolled-into-view', handleScrollTrigger);
        
        // Initial page load should scroll immediately
        const handlePageLoaded = () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        };
        
        window.addEventListener('chat-page-loaded', handlePageLoaded);
        
        return () => {
            window.removeEventListener('floyd-message-updated', handleScrollTrigger);
            window.removeEventListener('floyd-message-completed', handleScrollTrigger);
            window.removeEventListener('message-scrolled-into-view', handleScrollTrigger);
            window.removeEventListener('chat-page-loaded', handlePageLoaded);
        };
    }, [handleScrollTrigger]);

    // Just keep a single useEffect for messages.length changes
    useEffect(() => {
        if (isAutoScrollEnabled && messages.length > 0) {
            // Direct scroll without animation for message changes
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 50);
        }
    }, [messages.length, isAutoScrollEnabled]);

    // Check if user has scrolled away from bottom to show scroll button
    useEffect(() => {
        const checkScrollPosition = () => {
            const container = messagesContainerRef.current;
            if (!container) return;
            
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Use a more generous threshold to show the scroll button (200px)
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
            
            // Only show scroll button if we're not near bottom and have messages
            setShowScrollButton(!isNearBottom && messages.length > 0);
            
            // Only change auto-scroll state when user manually scrolls up/down
            if (!hasGeneratingMessage && !isTyping) {
                setIsAutoScrollEnabled(isNearBottom);
            }
        };
        
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [hasGeneratingMessage, isTyping, messages.length]);

    // Add debug logs to monitor indicator states
    useEffect(() => {
        // Debug the states that control the thinking/writing indicators
        console.log('Indicator States:', { 
            isTyping, 
            hasGeneratingMessage: messages.some(msg => msg.isGenerating),
            indicator: messages.some(msg => msg.isGenerating) ? 'Writing' : isTyping ? 'Thinking' : 'None'
        });
    }, [isTyping, messages]);

    // Auto focus on Floyd's responses - REMOVED
    
    // Memoize stable version of messages.length
    const messagesCount = messages.length;
    
    // Ensure messages are visible when loading a chat - REMOVED

    // Handle sending messages WITH controlled scrolling
    const handleSendMessage = () => {
        if (value.trim()) {
            // Send the message
            sendMessage(value.trim());
            setValue("");
            adjustHeight(true);
            
            // Focus on input after sending
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
            
            // Force auto-scroll when sending a message
            setIsAutoScrollEnabled(true);
            
            // Direct scroll to bottom when sending
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }
    };

    // Focus on input should not auto-scroll
    const handleInputFocus = () => {
        setInputFocused(true);
    };

    // Track scroll position for parallax effect with useCallback
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (container) {
            setScrollPosition(container.scrollTop);
        }
    }, []);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Prevent page scrolling
    useEffect(() => {
        // Apply overflow hidden to both html and body when component mounts
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Cleanup function to restore scrolling when component unmounts
        return () => {
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, []);

    // Add useEffect to scroll to bottom when component mounts
    useEffect(() => {
        // Use a short timeout to ensure DOM is fully rendered
        const initialScrollTimeout = setTimeout(() => {
            console.log('Initial scroll to bottom on page load');
            scrollToBottom(false); // Use immediate scrolling on initial load
        }, 300);

        return () => clearTimeout(initialScrollTimeout);
    }, [scrollToBottom]);

    // Fix the textareaRef.current.style.height template literals
    const handleEnhancePrompt = async () => {
        if (!value.trim()) return;
        
        // Use the actual AI-powered prompt enhancer
        const enhancedPrompt = await enhancePromptAPI(value.trim());
        
        // Set the enhanced value
        setValue(enhancedPrompt);
        
        // Force a refresh of the textarea to make it display properly
        setTimeout(() => {
            // Force the textarea to adjust its height to fit the content
            if (textareaRef.current) {
                // First force an explicit height larger than likely needed 
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 300)}px`;
                
                // Ensure the top of the textarea is visible
                textareaRef.current.scrollTop = 0;
                textareaRef.current.focus();
                
                // No auto-scrolling to show the textarea
                
                // Debugging message to help identify if this code is running
                console.log('Enhanced text set, height adjusted to:', textareaRef.current.style.height);
            }
            
            // Manual call to adjustHeight to double-check
            adjustHeight();
        }, 100); // Increased timeout for more reliability
    };

    const handleAttachFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const newAttachments = Array.from(files).map(file => file.name);
            setAttachments(prev => [...prev, ...newAttachments]);
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(`${selectedCommand.prefix} `);
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    const handleNewChat = () => {
        createNewChat();
        setValue("");
        adjustHeight(true);
    };

    // Star element rendering
    const renderStarElements = () => {
        return Array(15).fill(0).map((_, i) => (
            <div 
                key={`star-element-${i}-${Math.random().toString(36).substring(7)}`}
                className={cn(
                    "absolute rounded-full", 
                    isDark ? "bg-white/20" : "bg-black/10",
                )}
                style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.5 + Math.random() * 0.5,
                    transform: `translateY(${scrollPosition * (i % 5 === 0 ? -0.15 : i % 3 === 0 ? 0.12 : -0.08)}px)`,
                    boxShadow: isDark ? '0 0 4px rgba(255, 255, 255, 0.5)' : 'none',
                    animation: `twinkling ${2 + Math.random() * 3}s infinite alternate ${Math.random() * 2}s`
                }}
            />
        ));
    };
    
    // Command suggestion rendering
    const renderCommandSuggestions = () => {
        return commandSuggestions.map((suggestion, index) => (
            <motion.div
                key={`cmd-suggestion-${suggestion.prefix}-${index}`}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                    activeSuggestion === index 
                        ? isDark
                            ? "bg-white/10 text-white" 
                            : "bg-black/10 text-black"
                        : isDark
                            ? "text-white/70 hover:bg-white/5"
                            : "text-black/70 hover:bg-black/5"
                )}
                onClick={() => selectCommandSuggestion(index)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
            >
                <div className={cn(
                    "w-5 h-5 flex items-center justify-center",
                    isDark ? "text-white/60" : "text-black/60"
                )}>
                    {suggestion.icon}
                </div>
                <div className="font-medium">{suggestion.label}</div>
                <div className={isDark ? "text-white/40 text-xs ml-1" : "text-black/40 text-xs ml-1"}>
                    {suggestion.prefix}
                </div>
            </motion.div>
        ));
    };

    return (
        <div className={cn(
            "h-screen flex flex-col w-full items-center justify-center bg-transparent p-6 relative overflow-hidden",
            isDark ? "text-white" : "text-black"
        )}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
            />
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div 
                    className={cn(
                        "absolute w-96 h-96 rounded-full mix-blend-normal filter blur-[128px] animate-pulse",
                        isDark ? "bg-violet-500/10" : "bg-violet-500/5"
                    )}
                    style={{
                        top: `calc(0% + ${scrollPosition * 0.05}px)`, 
                        left: '25%',
                        transform: `translateY(${scrollPosition * -0.03}px)`
                    }}
                />
                <div 
                    className={cn(
                        "absolute w-96 h-96 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700",
                        isDark ? "bg-indigo-500/10" : "bg-indigo-500/5"
                    )}
                    style={{
                        bottom: `calc(0% + ${scrollPosition * 0.02}px)`, 
                        right: '25%',
                        transform: `translateY(${scrollPosition * 0.04}px)`
                    }}
                />
                <div 
                    className={cn(
                        "absolute w-64 h-64 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000",
                        isDark ? "bg-fuchsia-500/10" : "bg-fuchsia-500/5"
                    )}
                    style={{
                        top: `calc(25% + ${scrollPosition * 0.07}px)`, 
                        right: '33%',
                        transform: `translateY(${scrollPosition * -0.025}px)`
                    }}
                />
                
                {/* Add some small star elements that move more dramatically */}
                {renderStarElements()}
            </div>

            {/* Add twinkling animation */}
            <style jsx global>{`
                @keyframes twinkling {
                    0% { opacity: 0.2; }
                    100% { opacity: 0.7; }
                }
            `}</style>

            <div className="w-full max-w-2xl mx-auto relative flex flex-col h-[calc(100vh-40px)] overflow-hidden">
                <motion.div 
                    ref={messagesContainerRef}
                    className={cn(
                        "relative z-10 flex-grow overflow-y-auto px-4 sm:px-6 pt-20",
                        "hide-scrollbar"
                    )}
                    style={{ 
                        height: 'calc(100% - 120px)',
                        paddingBottom: '30px',
                        maxHeight: 'calc(100vh - 200px)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {messages.length === 0 ? (
                        <ChatPlaceholder />
                    ) : (
                        <div className="space-y-0.5 pt-4">
                            {messages.map((message) => (
                                <ChatMessageComponent 
                                    key={message.id || `${message.role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`} 
                                    message={message} 
                                />
                            ))}
                            {/* Add a smaller spacer at the bottom */}
                            <div className="h-6" />
                            <div ref={messagesEndRef} className="h-px" />
                        </div>
                    )}
                </motion.div>

                {/* Input section with absolute positioning */}
                <div 
                    className={cn(
                        "absolute left-0 right-0 bottom-0 w-full", 
                        "pt-2 pb-4 px-6 z-50"
                    )}
                >
                    {/* Button controls positioned directly above input */}
                    <div className="relative">
                        <div className="absolute right-2 -top-14 flex space-x-2 z-50">
                            {/* Go down button - enhanced and more visible */}
                            <AnimatePresence>
                                {showScrollButton && (
                                    <motion.button
                                        type="button"
                                        onClick={() => {
                                            scrollToBottom();
                                            setIsAutoScrollEnabled(true);
                                        }}
                                        className={cn(
                                            "p-2 rounded-full cursor-pointer shadow-md",
                                            "flex items-center justify-center gap-1",
                                            isDark 
                                                ? "bg-violet-600/90 hover:bg-violet-500 text-white/90" 
                                                : "bg-violet-500/90 hover:bg-violet-400 text-white/90"
                                        )}
                                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                        whileHover={{ scale: 1.05, opacity: 1 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Scroll to bottom"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                        <span className="text-xs font-medium">New messages</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Gradient overlay to ensure visual separation */}
                    <div 
                        className={cn(
                            "absolute left-0 right-0 bottom-0 w-full z-40",
                            "h-20 pointer-events-none top-[-20px]",
                            isDark 
                                ? "bg-gradient-to-t from-black via-black/90 to-transparent" 
                                : "bg-gradient-to-t from-white via-white/90 to-transparent"
                        )}
                    />

                    <motion.div 
                        className={cn(
                            "backdrop-blur-2xl rounded-2xl shadow-2xl border",
                            isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-black/[0.02] border-black/[0.05]"
                        )}
                        initial={{ scale: 0.98, y: 10, opacity: 0.8 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            boxShadow: '0 -10px 30px -10px rgba(0, 0, 0, 0.2)',
                            isolation: 'isolate',
                            position: 'relative',
                            zIndex: 60
                        }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className={cn(
                                        "absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl rounded-lg z-50 shadow-lg border overflow-hidden",
                                        isDark ? "bg-black/90 border-white/10" : "bg-white/90 border-black/10"
                                    )}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className={isDark ? "py-1 bg-black/95" : "py-1 bg-white/95"}>
                                        {renderCommandSuggestions()}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <ChatInputWrapper>
                            <ChatInput
                                value={value}
                                onChange={(text) => {
                                    setValue(text);
                                    adjustHeight();
                                }}
                                onSend={handleSendMessage}
                                onEnhance={handleEnhancePrompt}
                                onVoice={() => setVoiceModal(true)}
                                onAttachFile={handleAttachFile}
                                onShowCommands={() => setShowCommandPalette(true)}
                                isTyping={isTyping}
                                showCommands={showCommandPalette}
                                inputRef={textareaRef}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Floyd a question..."
                            />
                        </ChatInputWrapper>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={`attachment-${file}`}
                                            className={cn(
                                                "flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg",
                                                isDark
                                                    ? "bg-white/[0.03] text-white/70"
                                                    : "bg-black/[0.03] text-black/70"
                                            )}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button 
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className={cn(
                                                    "transition-colors",
                                                    isDark
                                                        ? "text-white/40 hover:text-white"
                                                        : "text-black/40 hover:text-black"
                                                )}
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Loading indicator - Show a spinner instead of text */}
            <AnimatePresence>
                {(isTyping && !hasGeneratingMessage) || (hasGeneratingMessage && !isTyping) ? (
                    <motion.div 
                        className="fixed bottom-36 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full p-2 shadow-lg border border-white/[0.05] z-40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        key="loading-spinner"
                    >
                        <LoadingSpinner />
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}

            {/* Voice modal overlay */}
            {voiceModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl mx-auto my-8 bg-background rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-6 flex flex-col min-h-[400px] max-h-[90vh] overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setVoiceModal(false)}
                          className="absolute top-4 right-4 z-10 text-base px-3 py-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          Close
                        </button>
                        <div className="w-full h-full overflow-y-auto pt-2">
                          <div className="h-full">
                            <RealtimeChatFixed />
                          </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Update the TypingDots function to be a LoadingSpinner
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <motion.div 
                className="w-5 h-5 rounded-full border-2 border-transparent border-t-white/70 border-l-white/70"
                animate={{ rotate: 360 }}
                transition={{ 
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                }}
            />
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="text-xs relative z-10">{label}</span>
            </div>
            
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
            
            <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

// Add custom scrollbar styles in a style tag at the end of the file, before the closing brace
const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

// Custom scrollbar styles
const customScrollbarStyles = `
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;             /* Chrome, Safari and Opera */
  width: 0;
  height: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar-dark::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar-dark::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-dark::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-scrollbar-light::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar-light::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-light::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.input-dark {
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.input-light {
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}
`;

// Add clickable cursor styles
const clickableElementsStyles = `
button, 
.clickable,
[role="button"],
a,
.interactive,
input[type="submit"],
input[type="button"],
input[type="reset"],
input[type="file"],
input[type="radio"] + label,
input[type="checkbox"] + label,
select {
  cursor: pointer !important;
}

textarea, 
input[type="text"],
input[type="password"],
input[type="email"],
input[type="number"],
input[type="search"],
input[type="tel"],
input[type="url"] {
  cursor: text !important;
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes + customScrollbarStyles + clickableElementsStyles;
    document.head.appendChild(style);
}


