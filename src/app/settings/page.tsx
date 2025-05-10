'use client';

import React, { useState, useEffect } from 'react';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, MessageSquare, Settings, Moon, Sun, ArrowLeft, PlusCircle, Bell, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { useTheme } from '@/components/theme-provider';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const isDark = resolvedTheme === 'dark';

  // Wait for hydration
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col", 
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      <StarsBackground 
        className="fixed inset-0 z-0" 
        starDensity={0.0005} 
        allStarsTwinkle={true} 
        minTwinkleSpeed={0.5} 
        maxTwinkleSpeed={1} 
        twinkleProbability={1} 
      />
      
      {/* Mobile Header */}
      <div className={cn(
        "md:hidden sticky top-0 z-50 w-full backdrop-blur-lg py-3 px-4",
        isDark 
          ? "border-b border-white/5 bg-black/30" 
          : "border-b border-gray-200 bg-white/70"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-md",
                isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-gray-100 text-gray-600"
              )}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <span className={cn(
              "text-lg font-bold",
              isDark ? "text-white" : "text-black"  
            )}>Settings</span>
          </div>
          
          <div className="flex gap-3">
            <Link href="/ai-agent" className={cn(
              "p-2 rounded-md",
              isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-gray-100 text-gray-600"
            )}>
              <Home size={20} />
            </Link>
            <Link href="/chat" className={cn(
              "p-2 rounded-md",
              isDark ? "hover:bg-white/5 text-white/70" : "hover:bg-gray-100 text-gray-600"
            )}>
              <MessageSquare size={20} />
            </Link>
          </div>
        </div>
      </div>
      
      <main className="relative z-10 flex-grow max-w-5xl w-full mx-auto pt-6 pb-16 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden md:block w-64 space-y-2">
            <Link href="/ai-agent">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-2",
                  isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-black hover:bg-gray-100"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/chat">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-2",
                  isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-black hover:bg-gray-100"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-2",
                isDark ? "text-white bg-white/10" : "text-black bg-gray-100"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
          
          {/* Main content */}
          <div className="flex-1 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            
            {/* Appearance section */}
            <div className={cn(
              "rounded-xl overflow-hidden shadow-sm",
              isDark ? "border border-white/5 bg-black/20 backdrop-blur-sm" : "border border-gray-200 bg-white"
            )}>
              <div className={cn(
                "p-5 border-b",
                isDark ? "border-white/5" : "border-gray-200"
              )}>
                <h2 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>Appearance</h2>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    {isDark ? (
                      <Moon className="text-blue-400" size={20} />
                    ) : (
                      <Sun className="text-yellow-500" size={20} />
                    )}
                    <span className={isDark ? "text-white" : "text-black"}>Theme</span>
                  </div>
                  <AnimatedThemeToggle mode="dropdown" />
                </div>
              </div>
            </div>
            
            {/* Notifications section */}
            <div className={cn(
              "rounded-xl overflow-hidden shadow-sm",
              isDark ? "border border-white/5 bg-black/20 backdrop-blur-sm" : "border border-gray-200 bg-white"
            )}>
              <div className={cn(
                "p-5 border-b",
                isDark ? "border-white/5" : "border-gray-200"
              )}>
                <h2 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>Notifications</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Bell className={isDark ? "text-yellow-500" : "text-yellow-500"} size={20} />
                    <span className={isDark ? "text-white" : "text-black"}>Push Notifications</span>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors focus:outline-none">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ml-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security section */}
            <div className={cn(
              "rounded-xl overflow-hidden shadow-sm",
              isDark ? "border border-white/5 bg-black/20 backdrop-blur-sm" : "border border-gray-200 bg-white"
            )}>
              <div className={cn(
                "p-5 border-b",
                isDark ? "border-white/5" : "border-gray-200"
              )}>
                <h2 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>Security</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Shield className={isDark ? "text-green-500" : "text-green-500"} size={20} />
                    <span className={isDark ? "text-white" : "text-black"}>Data Privacy</span>
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              </div>
            </div>
            
            {/* About section */}
            <div className={cn(
              "rounded-xl overflow-hidden shadow-sm",
              isDark ? "border border-white/5 bg-black/20 backdrop-blur-sm" : "border border-gray-200 bg-white"
            )}>
              <div className={cn(
                "p-5 border-b",
                isDark ? "border-white/5" : "border-gray-200"
              )}>
                <h2 className={cn(
                  "text-lg font-medium",
                  isDark ? "text-white" : "text-black"
                )}>About</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <HelpCircle className={isDark ? "text-purple-400" : "text-purple-600"} size={16} />
                  <span className={isDark ? "text-white/70" : "text-gray-600"}>Floyd AI Agent v0.1.0</span>
                </div>
                <p className={isDark ? "text-white/50" : "text-gray-500"}>
                  © 2023 Floyd AI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 