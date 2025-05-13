'use client';

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { SendIcon, Paperclip, Sparkles, LoaderIcon } from "lucide-react";
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
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none rounded-lg",
            "text-sm",
            "focus:outline-none",
            "min-h-[60px]",
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
          {onVoice && (
            <motion.button
              type="button"
              onClick={onVoice}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                isDark
                  ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]"
                  : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 1.5a3 3 0 00-3 3v7a3 3 0 006 0v-7a3 3 0 00-3-3zM5 10.5a7 7 0 0014 0M12 21v-3"
                />
              </svg>
              <span>Voice</span>
            </motion.button>
          )}

          {onEnhance && (
            <motion.button
              type="button"
              onClick={onEnhance}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                isDark 
                  ? "bg-white/[0.08] text-white/90 hover:bg-white/[0.12]" 
                  : "bg-black/[0.08] text-black/90 hover:bg-black/[0.12]"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enhance</span>
            </motion.button>
          )}
          
          <motion.button
            type="button"
            onClick={onSend}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={!value.trim() || isTyping}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              !value.trim() || isTyping
                ? isDark
                  ? "bg-white/[0.02] text-white/30 cursor-not-allowed"
                  : "bg-black/[0.02] text-black/30 cursor-not-allowed"
                : isDark
                  ? "bg-gradient-to-r from-violet-600/80 to-purple-600/80 text-white/90 hover:from-violet-500/80 hover:to-purple-500/80"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white/90 hover:from-violet-500 hover:to-purple-500"
            )}
          >
            {isTyping ? (
              <>
                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking</span>
              </>
            ) : (
              <>
                <SendIcon className="w-3.5 h-3.5" />
                <span>Send</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}