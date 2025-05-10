'use client';

import React, { useState, useEffect } from 'react';
import { PricingCard } from '@/components/ui/dark-gradient-pricing';
import { StarsBackground } from '@/components/ui/stars-background';
import { Home, Mail, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';

export default function MobilePlansPage() {
  const { resolvedTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

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
        ? 'min-h-screen w-full absolute inset-0 bg-black'
        : 'min-h-screen w-full absolute inset-0 bg-white'
    }>
      {/* Fixed background */}
      <StarsBackground className="fixed inset-0 z-0" starDensity={0.0005} allStarsTwinkle={true} minTwinkleSpeed={0.5} maxTwinkleSpeed={1} twinkleProbability={1} />
      
      {/* Scrollable content container */}
      <div className="absolute inset-0 overflow-y-auto">
        {/* Mobile nav bar - sticky at top */}
        <div className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-gray-800 py-3 px-4" 
             style={{ 
               backgroundColor: resolvedTheme === 'dark' 
                 ? 'rgba(0,0,0,0.7)' 
                 : 'rgba(255,255,255,0.7)' 
             }}>
          <div className="flex justify-between items-center">
            <Link href="/mobile" className={resolvedTheme === 'dark' ? "text-lg font-bold text-white" : "text-lg font-bold text-black"}>Floyd</Link>
            
            <div className="flex gap-3">
              <Link href="/mobile" className="p-2">
                <Home size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
              </Link>
              <Link href="/mobile/chat" className="p-2">
                <Mail size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
              </Link>
              <Link href="/mobile/plans" className="p-2">
                <CreditCard size={20} className={resolvedTheme === 'dark' ? 'text-white' : 'text-black'} />
              </Link>
              <Link href="/settings" className="p-2">
                <Settings size={20} className={resolvedTheme === 'dark' ? 'text-white/70' : 'text-black/70'} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="relative z-10 pt-6 pb-28 w-full px-4">
          <h1 className={`text-2xl font-bold mb-6 text-center ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
            Choose Your Floyd Plan
          </h1>
          
          <div className="flex flex-col gap-6 w-full pb-4">
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
    </div>
  );
} 