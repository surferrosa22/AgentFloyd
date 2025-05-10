'use client';

import React from 'react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { StarsBackground } from '@/components/ui/stars-background';
import { MainLayout } from '@/components/layout/main-layout';

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="relative flex-1 w-full">
          <StarsBackground 
            className="z-0 absolute inset-0" 
            starDensity={0.0005} 
            allStarsTwinkle={true} 
            minTwinkleSpeed={0.5} 
            maxTwinkleSpeed={1} 
            twinkleProbability={1} 
          />
          
          <div className="relative z-10 h-full">
            <AnimatedAIChat />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 