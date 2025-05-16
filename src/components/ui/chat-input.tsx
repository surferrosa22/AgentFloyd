'use client';

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { SendIcon, Paperclip, Sparkles, LoaderIcon, MicIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useChat } from '@/lib/chat-context';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onEnhance?: () => void;
  onAttachFile?: () => void;
  onShowCommands?: () => void;
  onVoice?: () => void;
  isTyping?: boolean;
  showCommands?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onEnhance,
  onAttachFile,
  onShowCommands,
  onVoice,
  isTyping = false,
  showCommands = false,
  inputRef,
  onKeyDown,
  placeholder = "Ask a question..."
}: ChatInputProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { sendMessage: contextSendMessage } = useChat();

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
            "w-full px-3 py-2",
            "resize-none",
            "bg-transparent",
            "border-none rounded-lg",
            "text-sm",
            "focus:outline-none",
            "min-h-[40px]",
            isDark
              ? "text-white/90 placeholder:text-white/30"
              : "text-black/90 placeholder:text-black/40"
          )}
          style={{
            overflow: "hidden",
          }}
        />
      </div>

      <div className={cn(
        "p-4 border-t flex items-center justify-between",
        isDark ? "border-white/10" : "border-gray-200"
      )}>
        {/* Left side action buttons */}
        <div className="flex items-center gap-4">
          {onAttachFile && (
            <motion.button
              type="button"
              onClick={onAttachFile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                isDark
                  ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]"
                  : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
              )}
              aria-label="Attach file"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </motion.button>
          )}
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {onEnhance && (
            <motion.button
              type="button"
              onClick={onEnhance}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                isDark 
                  ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]" 
                  : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
              )}
              aria-label="Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </motion.button>
          )}

          {value.trim() ? (
            // Send button when there is text
            <motion.button
              type="button"
              onClick={onSend}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTyping}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isTyping
                  ? isDark
                    ? "bg-white/[0.02] text-white/30 cursor-not-allowed"
                    : "bg-black/[0.02] text-black/30 cursor-not-allowed"
                  : isDark
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
              )}
              aria-label="Send"
            >
              {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
            </motion.button>
          ) : (
            onVoice && (
              <motion.button
                type="button"
                onClick={onVoice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isDark
                    ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]"
                    : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
                )}
                aria-label="Voice"
              >
                <MicIcon className="w-5 h-5" />
              </motion.button>
            )
          )}
        </div>
      </div>
    </div>
  );
}