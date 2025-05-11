'use client';

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { SendIcon, Paperclip, Command, Sparkles, LoaderIcon, Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onEnhance?: () => void;
  onAttachFile?: () => void;
  onShowCommands?: () => void;
  onVoiceInput?: () => void;
  isTyping?: boolean;
  showCommands?: boolean;
  isListening?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onEnhance,
  onAttachFile,
  onShowCommands,
  onVoiceInput,
  isTyping = false,
  showCommands = false,
  isListening = false,
  inputRef,
  onKeyDown,
  placeholder = "Ask a question...",
  className
}: ChatInputProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="w-full">
      <div className="p-4">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none rounded-lg",
            "text-sm",
            "focus:outline-none",
            "min-h-[60px]",
            isDark 
              ? "text-white/90 placeholder:text-white/30" 
              : "text-black/90 placeholder:text-black/40",
            className
          )}
          style={{
            overflow: "hidden",
          }}
        />
      </div>
      
      <div className={cn(
        "p-4 border-t flex items-center justify-between gap-4",
        isDark ? "border-white/10" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          {onAttachFile && (
            <motion.button
              type="button"
              onClick={onAttachFile}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark
                  ? "text-white/40 hover:text-white/90 hover:bg-white/[0.05]"
                  : "text-black/40 hover:text-black/90 hover:bg-black/[0.05]"
              )}
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onEnhance && (
            <motion.button
              type="button"
              onClick={onEnhance}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={!value.trim()}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer",
                value.trim()
                  ? isDark
                    ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]"
                    : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
                  : isDark
                    ? "bg-white/[0.03] text-white/30 cursor-not-allowed"
                    : "bg-black/[0.03] text-black/30 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enhance</span>
            </motion.button>
          )}
          
          {onVoiceInput && (
            <motion.button
              type="button"
              onClick={onVoiceInput}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer relative",
                isListening
                  ? isDark
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  : isDark
                    ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]"
                    : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
              )}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? "Stop" : "Voice"}</span>
              
              {/* Pulsing circle animation when recording */}
              {isListening && (
                <motion.span
                  className={cn(
                    "absolute inset-0 rounded-lg opacity-30",
                    isDark ? "bg-red-500" : "bg-red-500"
                  )}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          )}
          
          <motion.button
            type="button"
            onClick={onSend}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isTyping || !value.trim()}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer",
              value.trim()
                ? isDark
                  ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                  : "bg-black text-white shadow-lg shadow-black/10"
                : isDark
                  ? "bg-white/[0.05] text-white/40"
                  : "bg-black/[0.05] text-black/40"
            )}
          >
            {isTyping ? (
              <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
            <span>Send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
} 