'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Award } from 'lucide-react';
import GlassCard from './GlassCard';

export default function GamificationCard() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/gamification');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
      setProgress({ 
        prelims_questions: 0, 
        mains_questions: 0, 
        level: { name: 'Iron', color: 'text-gray-400' },
        levels: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return (
      <GlassCard>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  const currentLevel = progress?.level || { name: 'Iron', color: 'text-gray-400' };
  const nextLevel = progress?.levels?.find((l: any) => 
    l.prelims > (progress?.prelims_questions || 0) || l.mains > (progress?.mains_questions || 0)
  );

  const prelimsProgress = nextLevel ? 
    ((progress?.prelims_questions || 0) / nextLevel.prelims) * 100 : 100;
  const mainsProgress = nextLevel ? 
    ((progress?.mains_questions || 0) / nextLevel.mains) * 100 : 100;

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Your Level</h3>
          <p className={`text-sm font-medium ${currentLevel.color}`}>{currentLevel.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Prelims Questions</span>
            <span className="text-blue-400">{progress?.prelims_questions || 0}/30000</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${((progress?.prelims_questions || 0) / 30000) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Mains Questions</span>
            <span className="text-purple-400">{progress?.mains_questions || 0}/5000</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((progress?.mains_questions || 0) / 5000) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {nextLevel && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-1">
              Next: <span className={nextLevel.color}>{nextLevel.name}</span>
            </div>
            <div className="text-xs text-gray-500">
              Need {nextLevel.prelims - (progress?.prelims_questions || 0)} more prelims & {nextLevel.mains - (progress?.mains_questions || 0)} more mains questions
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}