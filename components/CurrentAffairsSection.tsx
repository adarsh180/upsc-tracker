'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Newspaper, Calendar } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function CurrentAffairsSection() {
  const [completed, setCompleted] = useState(0);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const total = 300;

  const handleCheckboxToggle = (index: number, checked: boolean) => {
    setCompleted(prev => checked ? prev + 1 : Math.max(0, prev - 1));
  };

  const progress = calculateProgress(completed, total);

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <Newspaper className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-yellow-400">Current Affairs</h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-yellow-400 mb-2">{progress}%</div>
        <div className="text-sm text-gray-400">{completed}/{total} topics</div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>Daily tracking</span>
        </div>
        <button
          onClick={() => setCompleted(prev => Math.min(total, prev + 1))}
          className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 px-3 py-1 rounded transition-colors"
        >
          +1 Topic
        </button>
      </div>

      <button
        onClick={() => setShowCheckboxes(!showCheckboxes)}
        className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors text-sm"
      >
        {showCheckboxes ? 'Hide' : 'Show'} Topics Grid
      </button>

      {showCheckboxes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 max-h-60 overflow-y-auto"
        >
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCheckboxToggle(i, i >= completed)}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded"
                title={`Topic ${i + 1}`}
              >
                {i < completed ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <Circle className="w-3 h-3 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}