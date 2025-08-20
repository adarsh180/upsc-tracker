'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, PenTool } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function EssaySection() {
  const [lecturesCompleted, setLecturesCompleted] = useState(0);
  const [essaysWritten, setEssaysWritten] = useState(0);
  const [showSection, setShowSection] = useState<'lectures' | 'essays' | null>(null);

  const totalLectures = 10;
  const totalEssays = 100;

  const lectureProgress = calculateProgress(lecturesCompleted, totalLectures);
  const essayProgress = calculateProgress(essaysWritten, totalEssays);

  const handleToggle = (type: 'lectures' | 'essays', index: number, checked: boolean) => {
    if (type === 'lectures') {
      setLecturesCompleted(prev => checked ? prev + 1 : Math.max(0, prev - 1));
    } else {
      setEssaysWritten(prev => checked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <PenTool className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-semibold text-red-400">Essay Writing</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Lectures</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{lectureProgress}%</div>
          <div className="text-xs text-gray-400">{lecturesCompleted}/{totalLectures}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${lectureProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <button
            onClick={() => setShowSection(showSection === 'lectures' ? null : 'lectures')}
            className="text-xs mt-2 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-1 rounded transition-colors"
          >
            {showSection === 'lectures' ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PenTool className="w-4 h-4 text-red-400" />
            <span className="text-sm">Essays</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{essayProgress}%</div>
          <div className="text-xs text-gray-400">{essaysWritten}/{totalEssays}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${essayProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <button
            onClick={() => setShowSection(showSection === 'essays' ? null : 'essays')}
            className="text-xs mt-2 bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
          >
            {showSection === 'essays' ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {showSection && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <h4 className="text-sm font-medium mb-3">
            {showSection === 'lectures' ? 'Lecture' : 'Essay'} Progress
          </h4>
          <div className={`grid gap-1 max-h-40 overflow-y-auto ${
            showSection === 'lectures' ? 'grid-cols-5' : 'grid-cols-10'
          }`}>
            {Array.from({ 
              length: showSection === 'lectures' ? totalLectures : totalEssays 
            }, (_, i) => (
              <button
                key={i}
                onClick={() => handleToggle(
                  showSection, 
                  i, 
                  i >= (showSection === 'lectures' ? lecturesCompleted : essaysWritten)
                )}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded"
                title={`${showSection === 'lectures' ? 'Lecture' : 'Essay'} ${i + 1}`}
              >
                {i < (showSection === 'lectures' ? lecturesCompleted : essaysWritten) ? (
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