'use client';

import { useChat } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Home, PlusCircle, Settings, MessageSquare, HelpCircle, Menu } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChatSidebar } from './chat-sidebar';

export function MiniSidebar() {
  const { clearMessages, createNewChat } = useChat();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleNewChat = () => {
    createNewChat();
    // If not already on the chat page, navigate there
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="fixed left-0 top-0 bottom-0 w-16 z-50 border-r bg-background/80 backdrop-blur-xl border-border/40 flex flex-col items-center py-4">
        <div className="flex flex-col items-center gap-1">
          <Link href="/ai-agent" className="p-2 mb-6">
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full border",
              isActive('/ai-agent') 
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent hover:bg-background/90 text-foreground/60 hover:text-foreground/80"
            )}>
              <span className="text-lg font-bold">F</span>
            </div>
          </Link>

          {/* Show menu button only at smaller screens */}
          <Button 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)} 
            size="icon" 
            variant="ghost" 
            className="sm:hidden group relative mb-2"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap text-xs transition-opacity">
              Menu
            </div>
          </Button>
          
          <Button 
            onClick={handleNewChat} 
            size="icon" 
            variant="ghost" 
            className={cn(
              "group relative",
              isActive('/chat') && !isActive('/ai-agent') && "bg-primary/10 text-primary"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap text-xs transition-opacity">
              New Chat
            </div>
          </Button>
          
          <Link href="/chat" className="mt-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "group relative",
                isActive('/chat') && "bg-primary/10 text-primary"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Chat</span>
              <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap text-xs transition-opacity">
                Chat
              </div>
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col gap-1 mt-auto">
          <Link href="/settings">
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "group relative",
                isActive('/settings') && "bg-primary/10 text-primary"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
              <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap text-xs transition-opacity">
                Settings
              </div>
            </Button>
          </Link>
          
          <Link href="/help">
            <Button 
              size="icon" 
              variant="ghost" 
              className="group relative"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
              <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap text-xs transition-opacity">
                Help
              </div>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile chat sidebar overlay */}
      {showMobileSidebar && (
        <div className="sm:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowMobileSidebar(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowMobileSidebar(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
          <div className="absolute top-0 left-0 bottom-0 w-72 z-50 transform translate-x-0 transition-all duration-300">
            <ChatSidebar />
          </div>
        </div>
      )}
    </>
  );
} 