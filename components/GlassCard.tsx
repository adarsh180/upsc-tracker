'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  variant = 'default',
  size = 'md'
}: GlassCardProps) {
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const variantClasses = {
    default: 'glass-effect',
    primary: 'card-primary',
    success: 'card-success',
    warning: 'card-warning', 
    error: 'card-error',
    premium: 'glass-effect-strong bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-indigo-400/20'
  };

  return (
    <motion.div
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        "relative overflow-hidden group",
        hover && "interactive cursor-pointer",
        glow && "neon-glow",
        className
      )}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      } : undefined}
      whileTap={hover ? { 
        scale: 0.98,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.3 }
      }}
    >
      {/* Shimmer effect for premium variant */}
      {(glow || variant === 'premium') && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}