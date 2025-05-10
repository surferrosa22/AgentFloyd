'use client';

import { useEffect, useState } from 'react';
import { GlowEffect } from '@/components/ui/glow-effect';
import { StarsBackground } from '@/components/ui/stars-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Home, Info, Mail, Settings, MessageSquare, HelpCircle } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from '@/components/theme-provider';

export default function FloydAIAgentLanding() {
  const { resolvedTheme } = useTheme();
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
    <div
      className={
        resolvedTheme === 'dark'
          ? 'relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 bg-black'
          : 'relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 bg-white'
      }
    >
      <StarsBackground className="z-0" starDensity={0.0010} allStarsTwinkle={true} minTwinkleSpeed={0.5} maxTwinkleSpeed={1} twinkleProbability={1} />
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="opacity-10 animate-pulse">
          <title>AI Glow Background</title>
          <defs>
            <radialGradient id="aiGlow" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={resolvedTheme === 'dark' ? '#222' : '#bbb'} stopOpacity="0.5" />
              <stop offset="100%" stopColor={resolvedTheme === 'dark' ? '#000' : '#fff'} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="60%" fill="url(#aiGlow)" />
        </svg>
      </div>
      <NavBar
        items={[
          { name: 'Home', url: 'http://192.168.1.45:3000/ai-agent', icon: Home },
          { name: 'Chat', url: '/chat', icon: Mail },
          { name: 'Settings', url: '/settings', icon: Settings },
        ]}
        className="top-0 left-1/2 -translate-x-1/2 z-50 pt-6"
      />
      
      <main className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className={
          resolvedTheme === 'dark'
            ? 'text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg mb-6 animate-fade-in'
            : 'text-5xl sm:text-6xl font-extrabold text-black drop-shadow-lg mb-6 animate-fade-in'
        }>
          Meet Floyd, Your AI Agent
        </h1>
        <p className={
          resolvedTheme === 'dark'
            ? 'text-xl sm:text-2xl max-w-2xl mb-10 animate-fade-in delay-200 text-gray-200'
            : 'text-xl sm:text-2xl max-w-2xl mb-10 animate-fade-in delay-200 text-gray-700'
        }>
          Floyd is your intelligent, always-on assistant—ready to help, automate, and empower your workflow. Experience the next generation of AI-driven productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-2">
          <Link
            href="/plans"
            className={`px-8 py-3 rounded-full text-base font-semibold shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${resolvedTheme === 'dark'
                ? 'bg-white text-black border border-white/10 hover:bg-gray-200 hover:text-black focus:ring-white'
                : 'bg-black text-white border border-black/10 hover:bg-gray-900 hover:text-white focus:ring-black'}
            `}
          >
            Plans
          </Link>
          <button
            className={`px-8 py-3 rounded-full text-base font-semibold shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${resolvedTheme === 'dark'
                ? 'bg-transparent text-white border border-white/30 hover:bg-white/10 hover:text-white focus:ring-white'
                : 'bg-transparent text-black border border-black/30 hover:bg-black/10 hover:text-black focus:ring-black'}
            `}
            type="button"
            onClick={() => router.push('/chat')}
          >
            Try for Free
          </button>
        </div>
      </main>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-in.delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
} 