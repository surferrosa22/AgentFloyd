import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple mobile device detection
function isMobileDevice(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Routes that should have mobile-specific versions
const MOBILE_ROUTES = [
  { desktop: '/', mobile: '/mobile' },
  { desktop: '/plans', mobile: '/mobile/plans' },
  { desktop: '/chat', mobile: '/mobile/chat' },
  { desktop: '/ai-agent', mobile: '/mobile' },
];

export function middleware(request: NextRequest) {
  // Get user agent
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Don't redirect if already on a mobile route
  if (path.startsWith('/mobile')) {
    return NextResponse.next();
  }

  // Check if it's a mobile device and find the corresponding mobile route
  if (isMobileDevice(userAgent)) {
    const route = MOBILE_ROUTES.find(route => 
      route.desktop === path || 
      (route.desktop !== '/' && path.startsWith(route.desktop))
    );

    if (route) {
      url.pathname = route.mobile;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Only run middleware on specific routes
export const config = {
  matcher: [
    '/',
    '/plans',
    '/chat',
    '/ai-agent',
    '/ai-agent/:path*',
  ],
}; 