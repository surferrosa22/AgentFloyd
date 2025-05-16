"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Set the active tab based on the current path
    const currentPath = pathname.split('?')[0] // Remove any query parameters
    
    // Find the item with URL that matches current path or ends with current path
    const matchingItem = items.find(item => {
      const itemPath = item.url.split('?')[0] // Remove any query parameters
      
      // Direct path match - handles cases like '/plans'
      if (itemPath === currentPath) {
        return true;
      }
      
      // Check if itemPath ends with currentPath - handles relative paths
      if (itemPath.endsWith(currentPath)) {
        return true;
      }
      
      // For absolute URLs, extract the path portion and compare
      if (itemPath.includes('//')) {
        const urlParts = itemPath.split('//')[1]?.split('/') || [];
        const pathPortion = `/${urlParts.slice(1).join('/') || ''}`;
        if (pathPortion === currentPath) {
          return true;
        }
      }
      
      // Handle exact match for Plans page
      if (item.name === 'Plans' && currentPath === '/plans') {
        return true;
      }
      
      return false;
    })
    
    if (matchingItem) {
      setActiveTab(matchingItem.name)
    }
  }, [pathname, items])

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto mb-6 pt-2",
        className,
      )}
    >
      <div className={cn(
        "flex items-center gap-3 border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg",
        isDarkMode 
          ? "bg-background/5 border-border" 
          : "bg-white/70 border-gray-200"
      )}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          if (item.name === 'Home') {
            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                  isDarkMode
                    ? "text-foreground/80 hover:text-primary"
                    : "text-gray-700 hover:text-primary",
                  isActive && (isDarkMode
                    ? "bg-muted text-primary"
                    : "bg-gray-100 text-primary")
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                isDarkMode 
                  ? "text-foreground/80 hover:text-primary" 
                  : "text-gray-700 hover:text-primary",
                isActive && (isDarkMode 
                  ? "bg-muted text-primary" 
                  : "bg-gray-100 text-primary")
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
