'use client';

import React from 'react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { StarsBackground } from '@/components/ui/stars-background';
import { ChatSidebar } from '@/components/ui/chat-sidebar';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="relative flex flex-1 w-full">
        <StarsBackground 
          className="z-0 absolute inset-0" 
          starDensity={0.0005} 
          allStarsTwinkle={true} 
          minTwinkleSpeed={0.5} 
          maxTwinkleSpeed={1} 
          twinkleProbability={1} 
        />
        
        <div className="hidden sm:block sm:w-64 md:w-72 lg:w-80">
          <ChatSidebar />
        </div>
        
        <div className="relative z-10 flex-1">
          <AnimatedAIChat />
        </div>
      </div>
    </div>
  );
} 