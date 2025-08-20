'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({ children, className, hover = true, glow = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6",
        "shadow-xl shadow-black/25",
        "relative overflow-hidden",
        hover && "hover:bg-white/15 transition-all duration-300",
        glow && "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:animate-shimmer",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}