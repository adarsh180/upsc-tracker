'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Calendar, BookOpen, FileText, Target, LogOut } from 'lucide-react';
import Link from 'next/link';
import SubjectCard from '@/components/SubjectCard';
import GlassCard from '@/components/GlassCard';
import AIInsights from '@/components/AIInsights';
import CurrentAffairsSection from '@/components/CurrentAffairsSection';
import EssaySection from '@/components/EssaySection';
import OptionalSection from '@/components/OptionalSection';
import CategoryCard from '@/components/CategoryCard';
import SpecialCategoryCard from '@/components/SpecialCategoryCard';
import MoodCalendar from '@/components/MoodCalendar';
import ProgressTrackerCard from '@/components/ProgressTrackerCard';
import CountdownTimer from '@/components/CountdownTimer';

import MotivationCard from '@/components/MotivationCard';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import PredictionCard from '@/components/PredictionCard';
import { SubjectProgress } from '@/types';

export default function Dashboard() {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authenticated');
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('authenticated');
    router.push('/');
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      if (!initialized) {
        // Initialize database and subjects
        await fetch('/api/init', { method: 'POST' });
        await fetch('/api/subjects/init', { method: 'POST' });
        setInitialized(true);
      }
      
      // Fetch subjects
      const response = await fetch('/api/subjects');
      const data = await response.json();
      
      // Ensure uniqueness by using subject and category as key
      const uniqueSubjects = Object.values(
        data.reduce((acc: { [key: string]: SubjectProgress }, curr: SubjectProgress) => {
          const key = `${curr.category}-${curr.subject}`;
          if (!acc[key] || curr.id < (acc[key].id || Infinity)) {
            acc[key] = curr;
          }
          return acc;
        }, {})
      ) as SubjectProgress[];
      
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectUpdate = async (id: number, field: string, value: number) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });

      if (!response.ok) {
        throw new Error('Failed to update subject');
      }

      setSubjects(prev => prev.map(subject => 
        subject.id === id ? { ...subject, [field]: value, updated_at: new Date().toISOString() } : subject
      ));
    } catch (error) {
      console.error('Failed to update subject:', error);
      // Refresh subjects from database on error
      const response = await fetch('/api/subjects');
      const data = await response.json();
      setSubjects(data);
    }
  };

  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.category]) acc[subject.category] = [];
    acc[subject.category].push(subject);
    return acc;
  }, {} as Record<string, SubjectProgress[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div className="space-y-3">
            <motion.h1 
              className="text-5xl md:text-6xl font-black gradient-text tracking-tight"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-xl text-neutral-300 leading-relaxed"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your elite preparation command center
            </motion.p>
            <motion.div
              className="flex items-center gap-2 text-sm text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Live tracking • Real-time analytics</span>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/dashboard/tests">
              <GlassCard 
                className="px-4 py-2 cursor-pointer bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border-indigo-400/20 hover:border-indigo-400/30 group"
                size="sm"
                hover={true}
              >
                <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">Tests</span>
              </GlassCard>
            </Link>
            <Link href="/dashboard/goals">
              <GlassCard 
                className="px-4 py-2 cursor-pointer bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-400/20 hover:border-purple-400/30 group"
                size="sm"
                hover={true}
              >
                <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">Goals</span>
              </GlassCard>
            </Link>
            <Link href="/dashboard/analysis">
              <GlassCard 
                className="px-4 py-2 cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-400/20 hover:border-green-400/30 group"
                size="sm"
                hover={true}
              >
                <span className="text-sm font-medium text-green-400 group-hover:text-green-300 transition-colors">Analysis</span>
              </GlassCard>
            </Link>
            <button onClick={handleSignOut}>
              <GlassCard 
                className="p-4 cursor-pointer bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-400/20 hover:border-red-400/30 group"
                size="sm"
                hover={true}
              >
                <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" />
              </GlassCard>
            </button>
          </motion.div>
        </div>

        {/* Countdown Timers */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CountdownTimer
            examName="UPSC CSE Prelims 2026"
            examDate="2026-05-24T00:00:00"
            color="text-indigo-400"
          />
          <CountdownTimer
            examName="UPSC CSE Mains 2026"
            examDate="2026-08-21T00:00:00"
            color="text-purple-400"
          />
        </motion.div>
        
        {/* Motivation Banner */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <MotivationCard />
        </motion.div>
      </motion.div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {Object.entries(groupedSubjects).map(([category, categorySubjects], categoryIndex) => {
          const categoryConfig = {
            'GS1': { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">1</div>, color: 'text-blue-400' },
            'GS2': { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">2</div>, color: 'text-blue-400' },
            'GS3': { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">3</div>, color: 'text-blue-400' },
            'GS4': { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">4</div>, color: 'text-blue-400' },
            'CSAT': { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">C</div>, color: 'text-blue-400' }
          }[category] || { icon: <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">?</div>, color: 'text-blue-400' };
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Link href={`/dashboard/${category.toLowerCase()}`}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <CategoryCard
                    category={category}
                    subjects={categorySubjects}
                    onUpdate={handleSubjectUpdate}
                    icon={categoryConfig.icon}
                    color={categoryConfig.color}
                  />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* AI Insights */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AIInsights progressData={subjects} />
      </motion.div>

      {/* AI Prediction Card */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <PredictionCard />
      </motion.div>

      {/* Special Sections */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/subjects/current-affairs">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <SpecialCategoryCard
              category="CURRENT AFFAIRS"
              icon={<div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center text-white font-bold text-sm">CA</div>}
              color="text-yellow-400"
            />
          </motion.div>
        </Link>
        <Link href="/subjects/essay">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <SpecialCategoryCard
              category="ESSAY"
              icon={<div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm">E</div>}
              color="text-red-400"
            />
          </motion.div>
        </Link>
        <Link href="/subjects/optional">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <SpecialCategoryCard
              category="OPTIONAL"
              icon={<div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">O</div>}
              color="text-purple-400"
            />
          </motion.div>
        </Link>
        <Link href="/subjects/psir">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <SpecialCategoryCard
              category="PSIR"
              icon={<div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">P</div>}
              color="text-indigo-400"
            />
          </motion.div>
        </Link>
      </motion.div>

      {/* Progress */}
      <motion.div
        className="mt-12 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ProgressTrackerCard />
      </motion.div>

      {/* Mood Calendar */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <MoodCalendar />
      </motion.div>
    </div>
  );
}