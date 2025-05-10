'use client';

import React from 'react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { StarsBackground } from '@/components/ui/stars-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Home, Info, Mail, Settings } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar
        items={[
          { name: 'Home', url: 'http://192.168.1.45:3000/ai-agent', icon: Home },
          { name: 'Chat', url: '/chat', icon: Mail },
          { name: 'Settings', url: '/settings', icon: Settings },
        ]}
        className="top-0 left-1/2 -translate-x-1/2 z-50 pt-6"
      />
      
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
  );
} 