'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

export default function MotivationCard() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch('/api/motivation');
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setQuote('Every expert was once a beginner. Keep going!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-400/20">
        <div className="animate-pulse flex items-center justify-center py-4">
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-400/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles className="w-20 h-20 text-green-400" />
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-green-500/20 rounded-full">
            <Quote className="w-6 h-6 text-green-400" />
          </div>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={quote}
          >
            <p className="text-lg font-semibold text-white leading-relaxed">
              "{quote}"
            </p>
            <p className="text-sm text-green-400 mt-1 font-medium">Daily Motivation • Refreshes every 3-4 hours</p>
          </motion.div>
        </div>
        
        <button
          onClick={fetchQuote}
          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-full transition-all duration-200 hover:scale-110"
        >
          <RefreshCw className="w-5 h-5 text-green-400" />
        </button>
      </div>
    </GlassCard>
  );
}