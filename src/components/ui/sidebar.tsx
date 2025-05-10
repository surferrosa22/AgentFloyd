'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  Settings, 
  User, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme } = useTheme();
  
  const navItems: NavItem[] = [
    { name: 'Home', href: '/ai-agent', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Plans', href: '/plans', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div 
      className={cn(
        "h-screen transition-all duration-300 border-r flex flex-col",
        resolvedTheme === 'dark' 
          ? "bg-zinc-900/50 border-zinc-800" 
          : "bg-white/50 border-gray-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "p-4 flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className={cn(
              "font-bold text-lg",
              resolvedTheme === 'dark' ? "text-white" : "text-black"
            )}>
              Floyd
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            resolvedTheme === 'dark' 
              ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" 
              : "hover:bg-gray-100 text-gray-500 hover:text-black"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? resolvedTheme === 'dark'
                      ? "bg-zinc-800 text-white"
                      : "bg-gray-100 text-black"
                    : resolvedTheme === 'dark'
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      : "text-gray-500 hover:text-black hover:bg-gray-100/50"
                )}
              >
                <IconComponent className={cn(
                  "flex-shrink-0 w-5 h-5",
                  isActive 
                    ? resolvedTheme === 'dark'
                      ? "text-violet-400"
                      : "text-violet-600"
                    : "opacity-70"
                )} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className={cn(
                      "absolute right-2 w-1.5 h-1.5 rounded-full",
                      resolvedTheme === 'dark' ? "bg-violet-400" : "bg-violet-600"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className={cn(
        "p-4 mt-auto",
        collapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          resolvedTheme === 'dark' 
            ? "text-zinc-400 hover:text-white hover:bg-zinc-800/50" 
            : "text-gray-500 hover:text-black hover:bg-gray-100/50"
        )}>
          <User className="w-5 h-5" />
          {!collapsed && (
            <span className="text-sm font-medium">John Smith</span>
          )}
        </div>
      </div>
    </div>
  );
}