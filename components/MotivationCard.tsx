'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, Sparkles, Heart, Star } from 'lucide-react';
import GlassCard from './GlassCard';

export default function MotivationCard() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/motivation');
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setQuote('Every expert was once a beginner. Keep pushing forward with determination!');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <GlassCard 
        className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border-emerald-400/20"
        variant="success"
      >
        <div className="flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border-emerald-400/20 hover:border-emerald-400/30 relative overflow-hidden group"
      variant="success"
      hover={false}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-24 h-24 text-emerald-400" />
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 left-1/4 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Star className="w-16 h-16 text-teal-400" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        {/* Icon Section */}
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/20">
            <Quote className="w-8 h-8 text-emerald-400" />
            <div className="absolute -top-1 -right-1">
              <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
        
        {/* Content Section */}
        <motion.div 
          className="flex-1 min-w-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={quote}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.p 
            className="text-lg md:text-xl font-semibold text-white leading-relaxed mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            "{quote}"
          </motion.p>
          
          <motion.div
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="gradient-text-success font-medium">Daily Inspiration</span>
            </div>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">Refreshes every 3-4 hours</span>
          </motion.div>
        </motion.div>
        
        {/* Refresh Button */}
        <motion.button
          onClick={fetchQuote}
          disabled={isRefreshing}
          className="flex-shrink-0 p-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-emerald-500/10 rounded-xl border border-emerald-400/20 hover:border-emerald-400/30 transition-all duration-300 group/btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ 
              duration: isRefreshing ? 1 : 0.3,
              repeat: isRefreshing ? Infinity : 0,
              ease: "linear"
            }}
          >
            <RefreshCw className="w-5 h-5 text-emerald-400 group-hover/btn:text-emerald-300 transition-colors" />
          </motion.div>
        </motion.button>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </GlassCard>
  );
}