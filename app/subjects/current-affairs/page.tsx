'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, Newspaper, Calendar, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

export default function CurrentAffairsSubjectsPage() {
  const [topics, setTopics] = useState<boolean[]>(new Array(300).fill(false));
  const [savedTopics, setSavedTopics] = useState<boolean[]>(new Array(300).fill(false));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const total = 300;

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/current-affairs');
      const data = await response.json();
      
      const newTopics = new Array(300).fill(false);
      for (let i = 0; i < (data.completed_topics || 0); i++) {
        newTopics[i] = true;
      }
      
      setTopics(newTopics);
      setSavedTopics([...newTopics]);
    } catch (error) {
      console.error('Failed to fetch current affairs progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const completedCount = topics.filter(Boolean).length;
      
      await fetch('/api/current-affairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_topics: completedCount
        })
      });
      
      setSavedTopics([...topics]);
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setTopics([...savedTopics]);
  };

  const hasChanges = JSON.stringify(topics) !== JSON.stringify(savedTopics);

  const handleCheckboxToggle = (index: number) => {
    setTopics(prev => prev.map((checked, i) => i === index ? !checked : checked));
  };

  const addOneTopic = () => {
    const firstUncheckedIndex = topics.findIndex(topic => !topic);
    if (firstUncheckedIndex !== -1) {
      handleCheckboxToggle(firstUncheckedIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const completed = topics.filter(Boolean).length;
  const progress = calculateProgress(completed, total);

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
            <h1 className="text-4xl font-bold gradient-text">Current Affairs</h1>
            <p className="text-gray-300 mt-2">Track 300 current affairs topics</p>
          </div>
        </div>
      </motion.div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-blue-400">Current Affairs Progress</h3>
        </div>

        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-blue-400 mb-2">{progress}%</div>
          <div className="text-lg text-gray-400">{completed}/{total} topics completed</div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

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

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>Daily tracking</span>
          </div>
          <button
            onClick={addOneTopic}
            className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded transition-colors"
          >
            +1 Topic
          </button>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => handleCheckboxToggle(i)}
              className="flex items-center justify-center p-2 hover:bg-white/10 rounded transition-colors"
              title={`Topic ${i + 1}`}
            >
              {topics[i] ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}