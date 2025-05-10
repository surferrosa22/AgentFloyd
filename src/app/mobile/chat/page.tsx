'use client';

import React, { useState, useEffect } from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, Mail, CreditCard, Settings } from 'lucide-react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';

export default function MobileChatPage() {
  const { resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={
      resolvedTheme === 'dark'
        ? 'min-h-screen flex flex-col overflow-y-auto transition-colors duration-500 bg-black'
        : 'min-h-screen flex flex-col overflow-y-auto transition-colors duration-500 bg-white'
    }>
      <StarsBackground className="fixed inset-0 z-0" starDensity={0.0005} allStarsTwinkle={true} minTwinkleSpeed={0.5} maxTwinkleSpeed={1} twinkleProbability={1} />
      
      {/* Mobile nav bar */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-gray-800 py-3 px-4" 
           style={{ 
             backgroundColor: resolvedTheme === 'dark' 
               ? 'rgba(0,0,0,0.7)' 
               : 'rgba(255,255,255,0.7)' 
           }}>
        <div className="flex justify-between items-center">
          <Link href="/mobile" className={resolvedTheme === 'dark' ? "text-lg font-bold text-white" : "text-lg font-bold text-black"}>Floyd</Link>
          
          <div className="flex gap-3">
            <Link href="/mobile" className="p-2">
              <Home size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </Link>
            <Link href="/mobile/chat" className="p-2">
              <Mail size={20} className={resolvedTheme === 'dark' ? 'text-white' : 'text-black'} />
            </Link>
            <Link href="/mobile/plans" className="p-2">
              <CreditCard size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </Link>
            <Link href="/settings" className="p-2">
              <Settings size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        <AnimatedAIChat />
      </div>
    </div>
  );
} 