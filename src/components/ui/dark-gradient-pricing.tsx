'use client';

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
}: PricingCardProps) => {
  // Check if we're on the client side
  const isBrowser = typeof window !== 'undefined';
  
  // If not in browser (during SSR), return a simplified version without animations
  if (!isBrowser) {
    return (
      <div className={cn(
        "relative h-full w-full overflow-hidden border rounded-xl",
        "dark:border-zinc-700 dark:bg-zinc-900",
        "border-zinc-200 bg-white",
        "p-6",
        className
      )}>
        {/* Static content */}
        <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-700 border-zinc-200">
          <span className="mb-6 inline-block dark:text-zinc-50 text-zinc-900">{tier}</span>
          <span className="mb-3 inline-block text-4xl font-medium">{price}</span>
          <span className="text-center">{bestFor}</span>
        </div>
        <div className="space-y-4 py-9">
          {benefits.map((benefit, index) => (
            <Benefit key={index} {...benefit} />
          ))}
        </div>
        <button className="w-full rounded-lg px-6 py-2 bg-black text-white">
          {CTA}
        </button>
      </div>
    );
  }

  // Client-side rendering with animations
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border",
          "dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-950/50 dark:to-zinc-900/80",
          "border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
          "p-6",
          className,
        )}
      >
        <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-700 border-zinc-200">
          <span className="mb-6 inline-block dark:text-zinc-50 text-zinc-900">
            {tier}
          </span>
          <span className="mb-3 inline-block text-4xl font-medium">
            {price}
          </span>
          <span className="dark:bg-gradient-to-br dark:from-zinc-200 dark:to-zinc-500 bg-gradient-to-br from-zinc-700 to-zinc-900 bg-clip-text text-center text-transparent">
            {bestFor}
          </span>
        </div>
        <div className="space-y-4 py-9">
          {benefits.map((benefit, index) => (
            <Benefit key={index} {...benefit} />
          ))}
        </div>
        <Button
          className="w-full"
          variant={tier === "Pro" ? "default" : "ghost"}
        >
          {CTA}
        </Button>
      </Card>
    </motion.div>
  )
}
