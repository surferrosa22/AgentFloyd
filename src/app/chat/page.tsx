'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import { StarsBackground } from '@/components/ui/stars-background';
import { ChatSidebar } from '@/components/ui/chat-sidebar';
import { Component as AnimatedMenuButton } from '@/components/ui/demo';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Home, MessageSquare, Settings } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('chatSidebarVisible');
    if (savedState !== null) {
      setIsSidebarVisible(savedState === 'true');
    }
  }, []);

  // Add a useEffect to scroll to the bottom when the page loads
  useEffect(() => {
    // Ensure chat is scrolled to bottom on initial render
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        
        // Dispatch a custom event to notify the chat component to scroll
        window.dispatchEvent(new CustomEvent('chat-page-loaded'));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarVisible;
    setIsSidebarVisible(newState);
    localStorage.setItem('chatSidebarVisible', String(newState));
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Navigation Bar */}
      <div className="hidden md:block">
        <NavBar
          items={[
            { name: 'Home', url: '/ai-agent', icon: Home },
            { name: 'Chat', url: '/chat', icon: MessageSquare },
            { name: 'Settings', url: '/settings', icon: Settings },
          ]}
          className="top-0 left-1/2 -translate-x-1/2 z-50 pt-6"
        />
      </div>

      <div className="relative flex flex-1 w-full">
        <StarsBackground 
          className="z-0 absolute inset-0" 
          starDensity={0.0005} 
          allStarsTwinkle={true} 
          minTwinkleSpeed={0.5} 
          maxTwinkleSpeed={1} 
          twinkleProbability={1} 
        />
        
        {/* Sidebar */}
        {isSidebarVisible && (
          <div className="hidden sm:block sm:w-64 md:w-72 lg:w-80 sticky top-0 h-screen overflow-hidden">
            <ChatSidebar />
          </div>
        )}
        
        {/* Custom Animated Toggle Button */}
        <div className={`fixed left-0 top-4 z-[100] hidden sm:block transition-all duration-300 ${
          isSidebarVisible ? 'sm:ml-64 md:ml-72 lg:ml-80' : 'ml-4'
        }`}>
          <div 
            className={cn(
              "rounded-md shadow-md backdrop-blur-sm cursor-pointer",
              isDark ? "bg-background/80" : "bg-gray-100"
            )}
          >
            <AnimatedMenuButton 
              externalOpen={isSidebarVisible} 
              onToggle={toggleSidebar} 
            />
          </div>
        </div>
        
        {/* Main Content - Fix the theme classes to be more stable */}
        <div 
          ref={chatContainerRef}
          className={cn(
            "relative z-10 flex-1",
            isDark ? "theme-dark" : "theme-light"
          )}
        >
          <AnimatedAIChat />
        </div>
      </div>
    </div>
  );
} 