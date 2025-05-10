"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun, MoonStar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

type ThemeMode = 'light' | 'dark' | 'system';

interface AnimatedThemeToggleProps {
  className?: string
  mode?: "icon" | "switch" | "dropdown"
  showLabel?: boolean
}

export function AnimatedThemeToggle({ 
  className, 
  mode = "switch",
  showLabel = false
}: AnimatedThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // Track if this is the initial render to prevent animation on first load
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  
  if (!isMounted) return null
  
  // Icon-only toggle with a morphing animation
  if (mode === "icon") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "relative w-10 h-10 rounded-full flex items-center justify-center z-50",
          "transition-colors duration-500",
          isDark 
            ? "bg-slate-800 text-yellow-300 hover:bg-slate-700" 
            : "bg-sky-100 text-orange-500 hover:bg-sky-200",
          className
        )}
        style={{ zIndex: 100 }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {isDark ? (
              <Moon strokeWidth={1.5} size={20} />
            ) : (
              <Sun strokeWidth={1.5} size={20} />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Glow effects */}
        <AnimatePresence mode="wait">
          {!isDark && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-full bg-yellow-300/20 blur-md -z-10"
            />
          )}
        </AnimatePresence>
      </button>
    )
  }
  
  // Switch toggle with sliding animation
  if (mode === "switch") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "relative w-16 h-8 rounded-full p-1 transition-colors duration-500 z-50",
          isDark 
            ? "bg-slate-700 border border-slate-600" 
            : "bg-sky-100 border border-sky-200",
          className
        )}
        style={{ zIndex: 100 }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {/* Track background with gradient */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-opacity duration-500",
          "bg-gradient-to-r from-orange-300 via-yellow-300 to-yellow-200",
          isDark ? "opacity-0" : "opacity-40"
        )} />
        
        {/* Night sky background (dark mode) */}
        <div className={cn(
          "absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500",
          isDark ? "opacity-40" : "opacity-0"
        )}>
          <div className="absolute inset-0 bg-blue-950" />
          <div className="absolute top-1 right-2 w-0.5 h-0.5 bg-white rounded-full opacity-70" />
          <div className="absolute top-3 right-5 w-1 h-1 bg-white rounded-full opacity-90" />
          <div className="absolute top-2 right-10 w-0.5 h-0.5 bg-white rounded-full opacity-60" />
          <div className="absolute top-4 right-8 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
        </div>
        
        {/* Moving thumb */}
        <motion.div
          initial={false}
          animate={{ 
            x: isDark ? 0 : 32, 
            backgroundColor: isDark ? "#334155" : "#ffda85"
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            backgroundColor: { duration: 0.3 }
          }}
          className="w-6 h-6 rounded-full relative flex items-center justify-center z-10 shadow-md"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? "dark" : "light"}
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              {isDark ? (
                <MoonStar strokeWidth={1.5} size={14} className="text-gray-100" />
              ) : (
                <Sun strokeWidth={1.5} size={14} className="text-amber-600" />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Sun rays or moon craters effect */}
          {!isDark && (
            <div className="absolute inset-0 rounded-full">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 8, 
                  repeat: Number.POSITIVE_INFINITY, 
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={`sun-ray-${i}`} 
                    className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-amber-500/20 rounded-full origin-left"
                    style={{ transform: `rotate(${i * 45}deg) translateX(0)` }}
                  />
                ))}
              </motion.div>
            </div>
          )}
        </motion.div>
        
        {/* Optional label */}
        {showLabel && (
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? "dark-label" : "light-label"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "absolute -bottom-7 left-0 right-0 text-center text-xs font-medium",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              {isDark ? "Dark Mode" : "Light Mode"}
            </motion.div>
          </AnimatePresence>
        )}
      </button>
    )
  }
  
  // Dropdown toggle with options
  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className={cn(
          "appearance-none pl-9 pr-4 py-2 rounded-lg text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "transition-colors duration-300",
          isDark 
            ? "bg-slate-800 text-gray-100 border border-slate-700 focus:ring-slate-500" 
            : "bg-white text-gray-800 border border-gray-200 focus:ring-sky-500"
        )}
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <div className="absolute top-0 bottom-0 left-2 flex items-center pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <MoonStar size={16} className="text-gray-300" strokeWidth={1.5} />
            ) : (
              <Sun size={16} className="text-amber-500" strokeWidth={1.5} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute top-0 bottom-0 right-2 flex items-center pointer-events-none">
        <svg 
          className={isDark ? "text-gray-400" : "text-gray-500"} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M6 8L10 4H2L6 8Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
} 