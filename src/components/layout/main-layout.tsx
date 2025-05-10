'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { resolvedTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex",
      resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'
    )}>
      {/* Hide sidebar on mobile devices */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'
      )}>
        {children}
      </main>
    </div>
  );
} 