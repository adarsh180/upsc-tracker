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
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        className="mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-6 mb-8">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlassCard 
                className="p-3 cursor-pointer bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-400/20 hover:border-yellow-400/30"
                size="sm"
              >
                <ArrowLeft className="w-5 h-5 text-yellow-400" />
              </GlassCard>
            </motion.div>
          </Link>
          
          <div className="flex-1">
            <motion.div
              className="flex items-center gap-4 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-400/20">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">CA</div>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black gradient-text-warning tracking-tight">
                  Current Affairs
                </h1>
                <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                  Daily News • Monthly Compilations • Important Events • Government Schemes
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-sm text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span>300 topics • Daily tracking • Live updates</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-400/20" variant="premium">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-400/20">
                <Newspaper className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-400">Progress Tracking</h3>
                <p className="text-sm text-neutral-400">Daily current affairs coverage</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-black text-yellow-400 mb-1">{progress}%</div>
              <div className="text-sm text-neutral-400">{completed}/{total} topics</div>
            </div>
          </div>

          <div className="progress-bar h-3 mb-8">
            <motion.div
              className="progress-fill h-full bg-gradient-to-r from-yellow-500 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
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
          ))
}
</div>
      </GlassCard>
    </div>
  );
}