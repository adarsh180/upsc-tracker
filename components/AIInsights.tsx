'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import { getPersonalizedInsights } from '@/lib/groq';

interface AIInsightsProps {
  progressData: any;
}

export default function AIInsights({ progressData }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const aiInsights = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressData })
      });
      const data = await aiInsights.json();
      setInsights(data.insights);
    } catch (error) {
      setInsights('Unable to generate insights at the moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-purple-400">AI Insights</h3>
        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      {!insights && !loading && (
        <div className="text-center py-6">
          <button
            onClick={generateInsights}
            className="bg-purple-500/20 hover:bg-purple-500/30 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <TrendingUp className="w-5 h-5" />
            Generate AI Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full"
          />
        </div>
      )}

      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <p className="text-gray-300 leading-relaxed">{insights}</p>
          </div>
          <button
            onClick={generateInsights}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Refresh Insights
          </button>
        </motion.div>
      )}
    </GlassCard>
  );
}