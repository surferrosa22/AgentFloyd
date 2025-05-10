'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { ChatSidebar } from './chat-sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileSidebar({ isOpen, onToggle }: MobileSidebarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);
  
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "fixed left-4 top-4 z-50 p-2 rounded-md transition-colors",
          isDark 
            ? "bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm" 
            : "bg-white/70 text-black hover:bg-white/90 backdrop-blur-sm",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Menu size={20} />
      </button>
      
      {/* Sidebar and Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            
            {/* Sidebar */}
            <motion.div
              className="fixed top-0 left-0 z-50 h-full w-[80%] max-w-[300px]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="relative h-full">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={onToggle}
                  className={cn(
                    "absolute right-4 top-4 z-10 p-2 rounded-full",
                    isDark 
                      ? "bg-white/10 text-white hover:bg-white/20" 
                      : "bg-black/10 text-black hover:bg-black/20"
                  )}
                >
                  <X size={20} />
                </button>
                
                {/* Sidebar Content */}
                <div className="h-full">
                  <ChatSidebar />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 