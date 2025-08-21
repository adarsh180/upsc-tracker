'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, BookOpen, PenTool, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function EssaySubjectsPage() {
  const [lectures, setLectures] = useState<boolean[]>(new Array(10).fill(false));
  const [essays, setEssays] = useState<boolean[]>(new Array(100).fill(false));
  const [savedLectures, setSavedLectures] = useState<boolean[]>(new Array(10).fill(false));
  const [savedEssays, setSavedEssays] = useState<boolean[]>(new Array(100).fill(false));
  const [showSection, setShowSection] = useState<'lectures' | 'essays' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totalLectures = 10;
  const totalEssays = 100;

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/essay');
      const data = await response.json();
      
      const newLectures = new Array(10).fill(false);
      const newEssays = new Array(100).fill(false);
      
      for (let i = 0; i < (data.lectures_completed || 0); i++) {
        newLectures[i] = true;
      }
      for (let i = 0; i < (data.essays_written || 0); i++) {
        newEssays[i] = true;
      }
      
      setLectures(newLectures);
      setEssays(newEssays);
      setSavedLectures([...newLectures]);
      setSavedEssays([...newEssays]);
    } catch (error) {
      console.error('Failed to fetch essay progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const lecturesCompleted = lectures.filter(Boolean).length;
      const essaysWritten = essays.filter(Boolean).length;
      
      await fetch('/api/essay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectures_completed: lecturesCompleted,
          essays_written: essaysWritten
        })
      });
      
      setSavedLectures([...lectures]);
      setSavedEssays([...essays]);
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setLectures([...savedLectures]);
    setEssays([...savedEssays]);
  };

  const hasChanges = JSON.stringify(lectures) !== JSON.stringify(savedLectures) || 
                    JSON.stringify(essays) !== JSON.stringify(savedEssays);

  const handleToggle = (type: 'lectures' | 'essays', index: number) => {
    if (type === 'lectures') {
      setLectures(prev => prev.map((checked, i) => i === index ? !checked : checked));
    } else {
      setEssays(prev => prev.map((checked, i) => i === index ? !checked : checked));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const lecturesCompleted = lectures.filter(Boolean).length;
  const essaysWritten = essays.filter(Boolean).length;
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

      {hasChanges && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetChanges}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      )}

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
                  onClick={() => handleToggle('lectures', i)}
                  className="flex items-center justify-center p-2 hover:bg-white/10 rounded transition-colors"
                  title={`Lecture ${i + 1}`}
                >
                  {lectures[i] ? (
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
                  onClick={() => handleToggle('essays', i)}
                  className="flex items-center justify-center p-1 hover:bg-white/10 rounded transition-colors"
                  title={`Essay ${i + 1}`}
                >
                  {essays[i] ? (
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
