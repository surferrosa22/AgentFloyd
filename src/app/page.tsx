'use client';
import { TextShimmer } from "@/components/ui/text-shimmer";
import { BlurFade } from "@/components/ui/blur-fade";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HoverPeek } from "@/components/ui/link-preview";

const zoomFadeVariant = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    filter: 'blur(6px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  visible: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    filter: 'blur(6px)',
    x: 0,
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [key, setKey] = useState(0);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    if (step < 1) {
      setStep((s) => s + 1);
      setKey((k) => k + 1);
    } else {
      setStep(3);
      setKey((k) => k + 1);
    }
  };

  const handleTryFloyd = () => {
    setShowCheckbox(true);
  };

  const handleContinue = () => {
    router.push("/ai-agent");
  };

  let text = '';
  if (step === 0) text = "Hello there!";
  else if (step === 1) text = "We've been waiting for you";

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full w-full px-4 py-8">
          {!showCheckbox && step < 3 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                className="w-full flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BlurFade
                  delay={0.25}
                  inView
                  variant={zoomFadeVariant}
                >
                  <TextShimmer
                    as="h1"
                    className="text-4xl font-bold cursor-pointer text-center"
                    duration={4}
                    onClick={handleClick}
                  >
                    {text}
                  </TextShimmer>
                </BlurFade>
              </motion.div>
            </AnimatePresence>
          )}
          <AnimatePresence mode="wait">
            {!showCheckbox && step === 3 && (
              <BlurFade
                key="try-floyd-btn"
                delay={0.25}
                inView
                variant={zoomFadeVariant}
              >
                <button
                  className="px-7 py-3 rounded-2xl bg-transparent border border-white/40 text-white text-lg font-semibold shadow-xl transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/40 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  type="button"
                  onClick={handleTryFloyd}
                >
                  <span
                    className="relative z-10 text-black dark:text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:animate-rainbow button-text-glow dark:group-hover:bg-gradient-to-r"
                    style={{
                      background: 'linear-gradient(270deg, red, orange, yellow, green, cyan, blue, violet, red)',
                      backgroundSize: '1200% 1200%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      animation: 'none',
                    }}
                  >
                    Try Floyd
                  </span>
                  <style jsx>{`
                    @keyframes rainbow {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    .group:hover .group-hover\:animate-rainbow {
                      animation: rainbow 2s linear infinite reverse !important;
                    }
                    .group:hover .group-hover\:bg-clip-text {
                      -webkit-background-clip: text !important;
                      background-clip: text !important;
                    }
                    .group:hover .group-hover\:text-transparent {
                      color: transparent !important;
                    }
                    .button-text-glow {
                      transition: text-shadow 0.3s;
                    }
                    .group:hover .button-text-glow {
                      text-shadow: 0 0 1px rgba(255,255,255,0.3), 0 0 2px rgba(255,255,255,0.15), 0 0 3px rgba(255,0,204,0.15), 0 0 3px rgba(0,204,255,0.15);
                    }
                  `}</style>
                </button>
              </BlurFade>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {showCheckbox && (
              <BlurFade
                key="checkbox"
                delay={0.25}
                inView
                variant={zoomFadeVariant}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={accepted} onCheckedChange={checked => setAccepted(checked === true)} />
                    <span 
                      className="text-base select-none text-black dark:text-gray-100 cursor-pointer" 
                      onClick={() => setAccepted(!accepted)}
                      onKeyDown={(e) => e.key === 'Enter' && setAccepted(!accepted)}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={accepted}
                    >
                      Accept <HoverPeek url="/terms" peekWidth={300} peekHeight={200}>
                        <a href="/terms" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                      </HoverPeek>
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    {accepted && (
                      <BlurFade
                        key="continue-btn"
                        delay={0.15}
                        inView
                        variant={zoomFadeVariant}
                      >
                        <button
                          className="mt-2 px-6 py-2 rounded-xl bg-black text-white text-base font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
                          type="button"
                          onClick={handleContinue}
                        >
                          Continue
                        </button>
                      </BlurFade>
                    )}
                  </AnimatePresence>
                </div>
              </BlurFade>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
