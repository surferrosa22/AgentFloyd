'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Simple hook to detect mobile devices
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Mobile wrapper component that can be used to conditionally render mobile layouts
export function MobileWrapper({
  children,
  mobileComponent: MobileComponent,
}: {
  children: React.ReactNode;
  mobileComponent: React.ComponentType<any>;
}) {
  const isMobile = useIsMobile();
  
  if (isMobile && MobileComponent) {
    return <MobileComponent />;
  }
  
  return children;
}

// Mobile redirect component that sends users to mobile-specific routes
export function MobileRedirect({ 
  mobileRoute, 
  children 
}: { 
  mobileRoute: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile && pathname && !pathname.startsWith('/mobile')) {
      router.push(mobileRoute);
    }
  }, [isMobile, mobileRoute, pathname, router]);
  
  if (isMobile) {
    // Return a loading state while redirecting
    return <div className="min-h-screen flex items-center justify-center">Redirecting to mobile view...</div>;
  }
  
  return children;
} 