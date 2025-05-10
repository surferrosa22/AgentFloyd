'use client';
import { TextShimmer } from "@/components/ui/text-shimmer";
import { BlurFade } from "@/components/ui/blur-fade";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HoverPeek } from "@/components/ui/link-preview";
import { StarsBackground } from '@/components/ui/stars-background';
import Link from 'next/link';
import { MessageSquare, Settings, HelpCircle } from 'lucide-react';

const zoomFadeVariant = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    filter: 'blur(6px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  visible: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    filter: 'blur(6px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
};

export default function HomePage() {
  return (
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
        
        <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-8">
            <span className="text-5xl font-bold text-white">F</span>
          </div>
          
          <h1 className="text-4xl font-bold text-center text-white mb-4">Welcome to Floyd</h1>
          <p className="text-xl text-white/70 text-center max-w-md mb-12">
            Your intelligent AI assistant, ready to help with anything.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <Link href="/chat" className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <MessageSquare className="w-10 h-10 text-indigo-400 mb-3" />
              <h2 className="text-lg font-medium mb-2">Chat</h2>
              <p className="text-white/60 text-center text-sm">Start a conversation with Floyd</p>
            </Link>
            
            <Link href="/settings" className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <Settings className="w-10 h-10 text-indigo-400 mb-3" />
              <h2 className="text-lg font-medium mb-2">Settings</h2>
              <p className="text-white/60 text-center text-sm">Customize your experience</p>
            </Link>
            
            <Link href="/help" className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <HelpCircle className="w-10 h-10 text-indigo-400 mb-3" />
              <h2 className="text-lg font-medium mb-2">Help</h2>
              <p className="text-white/60 text-center text-sm">Learn how to use Floyd</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
