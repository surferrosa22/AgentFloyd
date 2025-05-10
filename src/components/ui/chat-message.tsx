'use client';

import { motion } from 'framer-motion';
import { formatTimestamp } from '@/lib/utils';
import { CircleUserRound, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const { resolvedTheme } = useTheme();
  const isUser = message.role === 'user';

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
        "flex gap-3 items-start max-w-[90%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser 
            ? resolvedTheme === 'dark' ? "bg-white/10" : "bg-black/10"
            : resolvedTheme === 'dark' ? "bg-violet-900/30" : "bg-violet-100"
        )}>
          {isUser ? (
            <CircleUserRound className={cn(
              "w-5 h-5",
              resolvedTheme === 'dark' ? "text-white/70" : "text-black/70"
            )} />
          ) : (
            <Sparkles className={cn(
              "w-4 h-4",
              resolvedTheme === 'dark' ? "text-violet-300" : "text-violet-700"
            )} />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className={cn(
            "px-4 py-3 rounded-xl whitespace-pre-wrap",
            isUser 
              ? resolvedTheme === 'dark' 
                ? "bg-white text-black"
                : "bg-black text-white"
              : resolvedTheme === 'dark'
                ? "bg-zinc-800 text-white"
                : "bg-white text-black border border-gray-200"
          )}>
            {message.content}
          </div>
          <span className={cn(
            "text-xs mt-1",
            isUser ? "text-right" : "text-left",
            resolvedTheme === 'dark' ? "text-white/40" : "text-black/40"
          )}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}