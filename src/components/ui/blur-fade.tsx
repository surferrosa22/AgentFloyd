"use client"

import React from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  type Variants,
} from 'framer-motion';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = '-50px',
  blur = '6px',
}: BlurFadeProps) {
  const ref = React.useRef(null);
  // @ts-expect-error: useInView expects MarginType, but string works for our use case
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: 'blur(0px)' },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: 'easeOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface TextTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function TextTransition({ children, className }: TextTransitionProps) {
  return (
    <div className="space-y-4">
      <BlurFade delay={0.25} inView>
        {children}
      </BlurFade>
    </div>
  );
}

interface WelcomeTextProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function WelcomeText({
  title = 'Hello World 👋',
  subtitle = 'Nice to meet you',
  className,
}: WelcomeTextProps) {
  return (
    <section id="header" className={className}>
      <BlurFade delay={0.25} inView>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
          {title}
        </h2>
      </BlurFade>
      <BlurFade delay={0.5} inView>
        <span className="text-xl text-pretty tracking-tighter sm:text-3xl xl:text-4xl/none text-muted-foreground">
          {subtitle}
        </span>
      </BlurFade>
    </section>
  );
} 