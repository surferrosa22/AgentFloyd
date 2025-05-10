'use client';

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface ChatInputWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatInputWrapper({ children, className }: ChatInputWrapperProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div 
      className={cn(
        "relative backdrop-blur-2xl rounded-2xl shadow-lg border",
        isDark 
          ? "bg-white/[0.02] border-white/[0.05] text-white/90"
          : "bg-white/90 border-gray-200 text-black/90",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ChatPlaceholder() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="text-center space-y-3 my-12">
      <div className="inline-block">
        <h1 
          className={cn(
            "text-3xl font-medium tracking-tight bg-clip-text text-transparent pb-1",
            isDark 
              ? "bg-gradient-to-r from-white/90 to-white/40" 
              : "bg-gradient-to-r from-black/90 to-black/60"
          )}
        >
          How can I help today?
        </h1>
        <div 
          className={cn(
            "h-px",
            isDark
              ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-black/20 to-transparent"
          )}
        />
      </div>
      <p 
        className={cn(
          "text-sm",
          isDark ? "text-white/40" : "text-black/40"
        )}
      >
        Ask a question
      </p>
    </div>
  );
} 