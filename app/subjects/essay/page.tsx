'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function EssaySubjectsPage() {
  const [lecturesCompleted, setLecturesCompleted] = useState(0);
  const [essaysWritten, setEssaysWritten] = useState(0);
  const [showSection, setShowSection] = useState<'lectures' | 'essays' | null>(null);
  const [loading, setLoading] = useState(true);

  const totalLectures = 10;
  const totalEssays = 100;

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/essay');
      const data = await response.json();
      setLecturesCompleted(data.lectures_completed || 0);
      setEssaysWritten(data.essays_written || 0);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (lectures: number, essays: number) => {
    try {
      await fetch('/api/essay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectures_completed: lectures, essays_written: essays })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleToggle = (type: 'lectures' | 'essays', index: number, checked: boolean) => {
    if (type === 'lectures') {
      const newCompleted = checked ? lecturesCompleted + 1 : Math.max(0, lecturesCompleted - 1);
      setLecturesCompleted(newCompleted);
      updateProgress(newCompleted, essaysWritten);
    } else {
      const newCompleted = checked ? essaysWritten + 1 : Math.max(0, essaysWritten - 1);
      setEssaysWritten(newCompleted);
      updateProgress(lecturesCompleted, newCompleted);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const lectureProgress = calculateProgress(lecturesCompleted, totalLectures);
  const essayProgress = calculateProgress(essaysWritten, totalEssays);

  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <GlassCard className="p-2 cursor-pointer hover:scale-105 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </GlassCard>
          </Link>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Essay Writing</h1>
            <p className="text-gray-300 mt-2">10 lectures and 100 essays tracking</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-400">Lectures</h3>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-blue-400 mb-2">{lectureProgress}%</div>
            <div className="text-sm text-gray-400">{lecturesCompleted}/{totalLectures} completed</div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${lectureProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <button
            onClick={() => setShowSection(showSection === 'lectures' ? null : 'lectures')}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded transition-colors mb-4"
          >
            {showSection === 'lectures' ? 'Hide' : 'Show'} Checkboxes
          </button>

          {showSection === 'lectures' && (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalLectures }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleToggle('lectures', i, i >= lecturesCompleted)}
                  className="flex items-center justify-center p-2 hover:bg-white/10 rounded"
                  title={`Lecture ${i + 1}`}
                >
                  {i < lecturesCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <PenTool className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-400">Essays</h3>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-blue-400 mb-2">{essayProgress}%</div>
            <div className="text-sm text-gray-400">{essaysWritten}/{totalEssays} written</div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${essayProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          <button
            onClick={() => setShowSection(showSection === 'essays' ? null : 'essays')}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded transition-colors mb-4"
          >
            {showSection === 'essays' ? 'Hide' : 'Show'} Checkboxes
          </button>

          {showSection === 'essays' && (
            <div className="grid grid-cols-10 gap-1 max-h-60 overflow-y-auto">
              {Array.from({ length: totalEssays }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleToggle('essays', i, i >= essaysWritten)}
                  className="flex items-center justify-center p-1 hover:bg-white/10 rounded"
                  title={`Essay ${i + 1}`}
                >
                  {i < essaysWritten ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}