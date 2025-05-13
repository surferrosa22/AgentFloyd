"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
  color: string;
  twinklePhase: number;
  fadingOut?: boolean;
  fadeTimer?: number;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;

  /**
   * If true (default) the star field slowly drifts to give a parallax feel.
   * Set to false to keep the star positions fixed (they will still twinkle).
   */
  enableDrift?: boolean;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.000015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
  enableDrift = true,
}) => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const driftRef = useRef({ angle: Math.random() * Math.PI * 2, speed: 0.08 });

  const STAR_COLORS = [
    'rgba(255,255,255,', // white
    'rgba(225,235,255,', // lighter blue-white
    'rgba(255,250,240,', // lighter yellow-white
    'rgba(255,230,200,', // lighter yellow
    'rgba(255,220,220,', // lighter red
  ];

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        const parallax = Math.random() * 0.7 + 0.3; // keep for size/opacity realism
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 0.05 + 0.5) * parallax, // scale radius by parallax
          opacity: (Math.random() * 0.4 + 0.8) * parallax, // scale opacity by parallax
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
          color,
          twinklePhase: Math.random() * Math.PI * 2,
        };
      });
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ]
  );

  // Drift animation (parallax-like slow movement). Can be disabled via prop.
  useEffect(() => {
    if (!enableDrift) {
      // Ensure offset is reset when drift is disabled
      setOffset({ x: 0, y: 0 });
      return;
    }
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [generateStars]);

  useEffect(() => {
    let lastTime = performance.now();
    let driftChangeTimer = 0;
    let animationFrameId: number;
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      // Occasionally change drift direction
      driftChangeTimer += dt;
      if (driftChangeTimer > 4 + Math.random() * 3) { // every 4-7s
        driftRef.current.angle += (Math.random() - 0.5) * Math.PI / 2; // turn a bit
        driftRef.current.speed = 0.04 + Math.random() * 0.08; // 0.04-0.12 px/frame
        driftChangeTimer = 0;
      }
      setOffset(prev => {
        let x = prev.x + Math.cos(driftRef.current.angle) * driftRef.current.speed;
        let y = prev.y + Math.sin(driftRef.current.angle) * driftRef.current.speed;
        // Loop the offset for seamless effect
        return { x, y };
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now() * 0.001;
      for (const star of stars) {
        // Twinkle with phase offset
        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((now / star.twinkleSpeed) + star.twinklePhase) * 0.5);
        }
        // Handle fading out and in for blinking
        if (star.fadingOut) {
          star.opacity -= 0.04;
          if (star.opacity <= 0) {
            star.opacity = 0;
            star.fadingOut = false;
            star.fadeTimer = Math.floor(Math.random() * 30) + 10; // 10-40 frames delay
          }
        } else if (star.fadeTimer && star.fadeTimer > 0) {
          star.fadeTimer--;
          if (star.fadeTimer === 0) {
            // Move to new position and fade in
            const width = canvas.width;
            const height = canvas.height;
            star.x = Math.random() * width;
            star.y = Math.random() * height;
            star.radius = (Math.random() * 0.05 + 0.5) * (star.radius / Math.max(star.radius, 0.01));
            star.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
            star.twinklePhase = Math.random() * Math.PI * 2;
            star.opacity = 0.01 * (star.radius / Math.max(star.radius, 0.01));
          }
        } else if (star.opacity < 1 && !star.fadingOut) {
          star.opacity += 0.04;
          if (star.opacity > 1) star.opacity = 1;
        }
        // Apply drift offset and wrap around edges
        const width = canvas.width;
        const height = canvas.height;
        // eslint-disable-next-line
        let drawX = star.x + offset.x;
        // eslint-disable-next-line
        let drawY = star.y + offset.y;
        // Wrap horizontally
        if (drawX < 0) drawX += width;
        if (drawX > width) drawX -= width;
        // Wrap vertically
        if (drawY < 0) drawY += height;
        if (drawY > height) drawY -= height;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${star.opacity})`;
        ctx.shadowColor = `${star.color}${Math.min(star.opacity + 0.2, 1)})`;
        // Apply subtle glow to the largest 10% of stars
        if (star.radius > 0.95) {
          ctx.shadowBlur = 1;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Occasionally make a star fade out and reappear elsewhere
      if (stars.length > 0 && Math.random() < 0.02) { // ~2% chance per frame
        const i = Math.floor(Math.random() * stars.length);
        if (!stars[i].fadingOut && !stars[i].fadeTimer) {
          stars[i].fadingOut = true;
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars, offset.x, offset.y]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full absolute inset-0 pointer-events-none", className)}
    />
  );
};
