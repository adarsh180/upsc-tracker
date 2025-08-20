'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, PenTool, Save, RotateCcw } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function EssaySection() {
  const [lectures, setLectures] = useState<boolean[]>(new Array(10).fill(false));
  const [essays, setEssays] = useState<boolean[]>(new Array(100).fill(false));
  const [savedLectures, setSavedLectures] = useState<boolean[]>(new Array(10).fill(false));
  const [savedEssays, setSavedEssays] = useState<boolean[]>(new Array(100).fill(false));
  const [showSection, setShowSection] = useState<'lectures' | 'essays' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const totalLectures = 10;
  const totalEssays = 100;
  const lecturesCompleted = lectures.filter(Boolean).length;
  const essaysWritten = essays.filter(Boolean).length;

  const lectureProgress = calculateProgress(lecturesCompleted, totalLectures);
  const essayProgress = calculateProgress(essaysWritten, totalEssays);

  const handleToggle = (type: 'lectures' | 'essays', index: number) => {
    if (type === 'lectures') {
      setLectures(prev => prev.map((checked, i) => i === index ? !checked : checked));
    } else {
      setEssays(prev => prev.map((checked, i) => i === index ? !checked : checked));
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-4">
        <PenTool className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-semibold text-red-400">Essay Writing</h3>
      </div>

      {hasChanges && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetChanges}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      )}

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
                onClick={() => handleToggle(showSection, i)}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded transition-colors"
                title={`${showSection === 'lectures' ? 'Lecture' : 'Essay'} ${i + 1}`}
              >
                {(showSection === 'lectures' ? lectures[i] : essays[i]) ? (
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