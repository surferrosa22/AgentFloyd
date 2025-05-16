'use client';

import React, { useState, useEffect } from 'react';
import { PricingCard } from '@/components/ui/dark-gradient-pricing';
import { StarsBackground } from '@/components/ui/stars-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Home, Info, Mail, CreditCard, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlansPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('light');

  // Get theme from localStorage if available
  useEffect(() => {
    // Get theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('floyd-theme') || 'light';
      setTheme(savedTheme);
      
      // Mark component as loaded after hydration
      setIsLoaded(true);
    }
  }, []);

  const resolvedTheme = theme === 'system' 
    ? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  if (!isLoaded) {
    // Return simple loading state during hydration
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={
      resolvedTheme === 'dark'
        ? 'relative min-h-screen flex flex-col items-center overflow-y-auto transition-colors duration-500 bg-black'
        : 'relative min-h-screen flex flex-col items-center overflow-y-auto transition-colors duration-500 bg-white'
    }>
      <StarsBackground className="fixed inset-0 z-0" starDensity={0.0005} allStarsTwinkle={true} minTwinkleSpeed={0.5} maxTwinkleSpeed={1} twinkleProbability={1} />
      
      <NavBar
        items={[
          { name: 'Home', url: '/ai-agent', icon: Home },
          { name: 'Chat', url: '/chat', icon: Mail },
          { name: 'Plans', url: '/plans', icon: CreditCard },
          { name: 'Settings', url: '/settings', icon: Settings },
        ]}
        className="top-0 left-1/2 -translate-x-1/2 z-50 pt-6"
      />
      
      <main className="relative z-10 pt-32 pb-20 w-full max-w-6xl mx-auto px-4 flex-grow">
        <h1 className={`text-4xl font-bold mb-10 text-center ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
          Choose Your Floyd Plan
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          <PricingCard
            tier="Free"
            price="$0/mo"
            bestFor="Personal & Hobby Use"
            CTA="Get Started"
            benefits={[
              { text: 'Basic AI agent access', checked: true },
              { text: 'Community support', checked: true },
              { text: 'Limited automations', checked: true },
              { text: 'No custom integrations', checked: false },
            ]}
          />
          <PricingCard
            tier="Pro"
            price="$19/mo"
            bestFor="Teams & Power Users"
            CTA="Upgrade Now"
            benefits={[
              { text: 'All Free features', checked: true },
              { text: 'Unlimited automations', checked: true },
              { text: 'Priority support', checked: true },
              { text: 'Custom integrations', checked: true },
            ]}
          />
        </div>
      </main>
    </div>
  );
} 