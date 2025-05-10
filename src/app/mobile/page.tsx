'use client';

import React, { useState, useEffect } from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, Mail, CreditCard, ArrowRight, Settings, Menu } from 'lucide-react';
import { MobileSidebar } from '@/components/ui/mobile-sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export default function MobileHomePage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

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
      <MobileSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Mobile nav bar */}
      <div className={cn(
        "sticky top-0 z-30 w-full backdrop-blur-lg border-b py-3 px-4",
        isDark ? "border-white/10 bg-black/70" : "border-black/10 bg-white/70"
      )}>
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
              <Home size={20} className={isDark ? 'text-white' : 'text-black'} />
            </Link>
            <Link href="/mobile/chat" className="p-2">
              <Mail size={20} className={isDark ? 'text-white/70' : 'text-black/70'} />
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
      
      <main className="relative z-10 pt-6 pb-6 w-full px-4 flex-grow flex flex-col justify-center">
        <div className="flex flex-col items-center text-center mt-10 mb-16">
          <h1 className={
            isDark
              ? 'text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg mb-4'
              : 'text-3xl sm:text-4xl font-extrabold text-black drop-shadow-lg mb-4'
          }>
            Meet Floyd, Your AI Agent
          </h1>
          <p className={
            isDark
              ? 'text-base max-w-xs mb-8 text-gray-300'
              : 'text-base max-w-xs mb-8 text-gray-700'
          }>
            Your intelligent, always-on assistant—ready to help, automate, and empower your workflow.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={() => router.push('/mobile/chat')}
              className="w-full px-5 py-3 rounded-full bg-white text-black font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>Try for Free</span>
              <ArrowRight size={16} />
            </button>
            
            <Link
              href="/mobile/plans"
              className={`w-full px-5 py-3 rounded-full font-semibold flex items-center justify-center
                ${isDark
                  ? 'bg-transparent text-white border border-white/30'
                  : 'bg-transparent text-black border border-black/30'
                }`}
            >
              View Plans
            </Link>
          </div>
        </div>
        
        <div className={`rounded-2xl p-5 mb-6 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
            What can Floyd do?
          </h2>
          <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className="text-sm mt-1">•</span>
              <span>Answer questions instantly with AI-powered knowledge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sm mt-1">•</span>
              <span>Automate repetitive tasks in your workflow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sm mt-1">•</span>
              <span>Learn your preferences and adapt to your needs</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
} 