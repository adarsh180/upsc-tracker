'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, TrendingUp, Target, Award, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import SubjectCard from '@/components/SubjectCard';
import { SubjectProgress } from '@/types';
import { calculateProgress } from '@/lib/utils';

interface SubjectPageTemplateProps {
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientClass: string;
  borderClass: string;
  iconBgClass: string;
}

export default function SubjectPageTemplate({
  category,
  title,
  description,
  icon,
  gradientClass,
  borderClass,
  iconBgClass
}: SubjectPageTemplateProps) {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, [category]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      
      // Filter subjects by category and ensure uniqueness
      const categorySubjects = data.filter((s: SubjectProgress) => s.category === category);
      const uniqueSubjects = Object.values(
        categorySubjects.reduce((acc: { [key: string]: SubjectProgress }, curr: SubjectProgress) => {
          const key = `${curr.category}-${curr.subject}`;
          if (!acc[key] || curr.id < (acc[key].id || Infinity)) {
            acc[key] = curr;
          }
          return acc;
        }, {})
      ) as SubjectProgress[];
      
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectUpdate = async (id: number, field: string, value: number) => {
    try {
      await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });

      setSubjects(prev => prev.map(subject => 
        subject.id === id ? { ...subject, [field]: value } : subject
      ));
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
  };

  // Calculate overall statistics
  const totalLectures = subjects.reduce((sum, s) => sum + s.total_lectures, 0);
  const completedLectures = subjects.reduce((sum, s) => sum + s.completed_lectures, 0);
  const totalDpps = subjects.reduce((sum, s) => sum + s.total_dpps, 0);
  const completedDpps = subjects.reduce((sum, s) => sum + s.completed_dpps, 0);
  const totalRevisions = subjects.reduce((sum, s) => sum + s.revisions, 0);
  
  const lectureProgress = calculateProgress(completedLectures, totalLectures);
  const dppProgress = calculateProgress(completedDpps, totalDpps);
  const overallProgress = Math.round((lectureProgress + dppProgress) / 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-12 h-12 border-4 ${borderClass} border-t-transparent rounded-full`}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${gradientClass} rounded-full blur-3xl animate-pulse-slow`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${gradientClass} rounded-full blur-3xl animate-pulse-slow`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Header Section */}
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
                className={`p-3 cursor-pointer bg-gradient-to-br ${gradientClass} ${borderClass} hover:border-opacity-30`}
                size="sm"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-400" />
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
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientClass} ${borderClass}`}>
                {icon}
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black gradient-text-primary tracking-tight">
                  {title}
                </h1>
                <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-sm text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span>{subjects.length} subjects • {totalLectures + totalDpps} total items</span>
            </motion.div>
          </div>
        </div>

        {/* Statistics Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className={`text-center bg-gradient-to-br ${gradientClass} ${borderClass}`} size="sm">
            <BookOpen className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-indigo-400 mb-1">{lectureProgress}%</div>
            <div className="text-xs text-neutral-400">Lectures</div>
            <div className="text-xs text-neutral-500 mt-1">{completedLectures}/{totalLectures}</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-400/20" size="sm">
            <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-purple-400 mb-1">{dppProgress}%</div>
            <div className="text-xs text-neutral-400">DPPs</div>
            <div className="text-xs text-neutral-500 mt-1">{completedDpps}/{totalDpps}</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-400/20" size="sm">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-emerald-400 mb-1">{overallProgress}%</div>
            <div className="text-xs text-neutral-400">Overall</div>
            <div className="text-xs text-neutral-500 mt-1">Progress</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-400/20" size="sm">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-yellow-400 mb-1">{totalRevisions}</div>
            <div className="text-xs text-neutral-400">Revisions</div>
            <div className="text-xs text-neutral-500 mt-1">Completed</div>
          </GlassCard>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className={`bg-gradient-to-br ${gradientClass} ${borderClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Overall Progress</h3>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Clock className="w-4 h-4" />
                <span>Live tracking</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-300">Lectures Progress</span>
                  <span className="text-sm font-medium text-indigo-400">{lectureProgress}%</span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className="progress-fill h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${lectureProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-300">DPPs Progress</span>
                  <span className="text-sm font-medium text-purple-400">{dppProgress}%</span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className="progress-fill h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${dppProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Subjects Grid */}
      <motion.div
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 + index * 0.1 }}
          >
            <SubjectCard
              subject={subject}
              onUpdate={handleSubjectUpdate}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <GlassCard className="max-w-md mx-auto">
            <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-300 mb-2">No Subjects Found</h3>
            <p className="text-neutral-400 text-sm">
              No {category} subjects are currently available. Please check back later or contact support.
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}