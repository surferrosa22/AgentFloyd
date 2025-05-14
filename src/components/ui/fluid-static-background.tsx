"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FluidStaticBackgroundProps {
  className?: string;
  // Optional: allow speed customization (seconds per full cycle)
  speed?: number;
  // Optional: override colors
  colors?: string;
}

/**
 * Lightweight animated gradient background without pointer interaction.
 * Uses a large linear-gradient that slowly animates its background-position to
 * create a fluid-like motion. Designed for use behind modal content where full
 * WebGL fluid simulation would be too heavy.
 */
export function FluidStaticBackground({
  className,
  speed = 45,
  colors = "linear-gradient(115deg,#7f2fff 0%,#00d4ff 50%,#ff0080 100%)",
}: FluidStaticBackgroundProps) {
  return (
    <motion.div
      aria-hidden
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden blur-2xl opacity-30 mix-blend-screen",
        className,
      )}
      style={{ background: colors, backgroundSize: "400% 400%" }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    />
  );
}
