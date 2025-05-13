'use client';

import React, { useState, useEffect } from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, Mail, CreditCard, Settings, Menu } from 'lucide-react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { MobileSidebar } from '@/components/ui/mobile-sidebar';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export default function MobileChatPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={cn(
      'min-h-screen flex flex-col overflow-y-auto transition-colors duration-500',
      isDark ? 'bg-black' : 'bg-white'
    )}>
      <StarsBackground className="fixed inset-0 z-0" starDensity={0.0005} allStarsTwinkle={true} minTwinkleSpeed={0.5} maxTwinkleSpeed={1} twinkleProbability={1} />
      
      {/* Mobile Sidebar */}
      {!voiceModalOpen && <MobileSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />}
      
      {/* Mobile nav bar */}
      {!voiceModalOpen && (
        <div 
          className={cn(
            "sticky top-0 z-30 w-full backdrop-blur-lg border-b py-3 px-4",
            isDark ? "border-white/10 bg-black/70" : "border-black/10 bg-white/70"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                type="button"
                className={cn(
                  "mr-3 p-2 rounded-md",
                  isDark ? "text-white/80" : "text-black/80"
                )}
                onClick={toggleSidebar}
              >
                <Menu size={20} />
              </button>
              <Link href="/mobile" className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-black"}>
                Floyd
              </Link>
            </div>
            
            <div className="flex gap-3">
              <Link href="/mobile" className="p-2">
                <Home size={20} className={isDark ? 'text-white/70' : 'text-black/70'} />
              </Link>
              <Link href="/mobile/chat" className="p-2">
                <Mail size={20} className={isDark ? 'text-white' : 'text-black'} />
              </Link>
              <Link href="/mobile/plans" className="p-2">
                <CreditCard size={20} className={isDark ? 'text-white/70' : 'text-black/70'} />
              </Link>
              <Link href="/settings" className="p-2">
                <Settings size={20} className={isDark ? 'text-white/70' : 'text-black/70'} />
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        <AnimatedAIChat voiceModalOpen={voiceModalOpen} setVoiceModalOpen={setVoiceModalOpen} />
      </div>
    </div>
  );
} 