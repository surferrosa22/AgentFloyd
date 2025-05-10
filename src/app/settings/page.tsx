'use client';

import React, { useState, useEffect } from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, Mail, CreditCard, Settings, Moon, Sun, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { useTheme } from '@/components/theme-provider';
import { cn } from "@/lib/utils"
import { NavBar } from '@/components/ui/tubelight-navbar';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

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
      
      {/* Navigation */}
      <div className="hidden md:block">
        <NavBar
          items={[
            { name: 'Home', url: '/ai-agent', icon: Home },
            { name: 'Chat', url: '/chat', icon: Mail },
            { name: 'Settings', url: '/settings', icon: Settings },
          ]}
          className="top-0 left-1/2 -translate-x-1/2 z-50 pt-6"
        />
      </div>
      
      {/* Mobile nav bar - only shows on small screens */}
      <div className="md:hidden sticky top-0 z-50 w-full backdrop-blur-lg border-b border-gray-800 py-3 px-4" 
           style={{ 
             backgroundColor: resolvedTheme === 'dark' 
               ? 'rgba(0,0,0,0.7)' 
               : 'rgba(255,255,255,0.7)' 
           }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </button>
            <span className={resolvedTheme === 'dark' ? "text-lg font-bold text-white" : "text-lg font-bold text-black"}>Settings</span>
          </div>
          
          <div className="flex gap-3">
            <Link href="/ai-agent" className="p-2">
              <Home size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </Link>
            <Link href="/chat" className="p-2">
              <Mail size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
            </Link>
            <Link href="/settings" className="p-2">
              <Settings size={20} className={resolvedTheme === 'dark' ? 'text-white' : 'text-black'} />
            </Link>
          </div>
        </div>
      </div>
      
      <main className="relative z-10 pt-6 pb-6 w-full px-4 flex-grow max-w-3xl mx-auto">
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 text-center md:text-left ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
          Settings
        </h1>
        
        <div className={cn(
          "rounded-xl overflow-hidden border shadow-sm mb-4",
          resolvedTheme === 'dark' 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-white border-gray-200"
        )}>
          <div className="p-4 md:p-6">
            <h2 className={`text-lg font-medium mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
              Appearance
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="text-blue-400" size={20} />
                  ) : (
                    <Sun className="text-yellow-500" size={20} />
                  )}
                  <span className={resolvedTheme === 'dark' ? 'text-white' : 'text-black'}>
                    Theme
                  </span>
                </div>
                
                <div className="flex items-center">
                  <AnimatedThemeToggle mode="dropdown" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "rounded-xl overflow-hidden border shadow-sm mb-4",
          resolvedTheme === 'dark' 
            ? "bg-zinc-900 border-zinc-800" 
            : "bg-white border-gray-200"
        )}>
          <div className="p-4 md:p-6">
            <h2 className={`text-lg font-medium mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
              About
            </h2>
            
            <div className="flex flex-col gap-2 text-sm">
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Floyd AI Agent v0.1.0
              </p>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                © 2023 Floyd AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 