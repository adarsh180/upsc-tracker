'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award, BookOpen, FileText, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

interface SpecialCategoryCardProps {
  category: 'CURRENT AFFAIRS' | 'ESSAY' | 'OPTIONAL';
  icon: React.ReactNode;
  color: string;
}

export default function SpecialCategoryCard({ category, icon, color }: SpecialCategoryCardProps) {
  const [progress, setProgress] = useState({ lectures: 0, dpps: 0, overall: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [category]);

  const fetchProgress = async () => {
    try {
      let lectureProgress = 0;
      let dppProgress = 0;

      if (category === 'CURRENT AFFAIRS') {
        const response = await fetch('/api/current-affairs');
        const data = await response.json();
        lectureProgress = calculateProgress(data.completed_topics || 0, 300);
        dppProgress = 0;
      } else if (category === 'ESSAY') {
        const response = await fetch('/api/essay');
        const data = await response.json();
        lectureProgress = calculateProgress(data.lectures_completed || 0, 10);
        dppProgress = calculateProgress(data.essays_written || 0, 100);
      } else if (category === 'OPTIONAL') {
        const response = await fetch('/api/optional');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const totalCompleted = data.reduce((sum, item) => sum + (item.completed_items || 0), 0);
          const totalItems = 4 * 140; // 4 sections × 140 items each
          lectureProgress = calculateProgress(totalCompleted, totalItems);
          dppProgress = lectureProgress; // Same progress for both
        }
      }

      const overallProgress = Math.round((lectureProgress + dppProgress) / 2);
      setProgress({ lectures: lectureProgress, dpps: dppProgress, overall: overallProgress });
    } catch (error) {
      console.error(`Failed to fetch ${category} progress:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressBadge = () => {
    if (progress.overall >= 90) return { 
      icon: <Award className="w-3 h-3" />, 
      color: 'text-yellow-300', 
      bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      label: 'Master',
      ring: 'stroke-yellow-400'
    };
    if (progress.overall >= 75) return { 
      icon: <Trophy className="w-3 h-3" />, 
      color: 'text-emerald-300', 
      bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      label: 'Expert',
      ring: 'stroke-emerald-400'
    };
    if (progress.overall >= 50) return { 
      icon: <Star className="w-3 h-3" />, 
      color: 'text-indigo-300', 
      bg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      label: 'Advanced',
      ring: 'stroke-indigo-400'
    };
    return { 
      icon: <Target className="w-3 h-3" />, 
      color: 'text-neutral-400', 
      bg: 'bg-gradient-to-r from-neutral-500/20 to-gray-500/20',
      label: 'Beginner',
      ring: 'stroke-neutral-400'
    };
  };

  const badge = getProgressBadge();

  const getLabels = () => {
    if (category === 'CURRENT AFFAIRS') return { left: 'Topics', right: 'Updates' };
    if (category === 'ESSAY') return { left: 'Lectures', right: 'Essays' };
    return { left: 'Sections', right: 'Progress' };
  };

  const labels = getLabels();

  const getGradientClass = () => {
    if (color.includes('yellow')) return 'from-yellow-500/10 to-amber-500/5';
    if (color.includes('red')) return 'from-red-500/10 to-pink-500/5';
    if (color.includes('purple')) return 'from-purple-500/10 to-pink-500/5';
    return 'from-blue-500/10 to-indigo-500/5';
  };

  const getDescription = () => {
    if (category === 'CURRENT AFFAIRS') return '300 topics • Daily updates';
    if (category === 'ESSAY') return '10 lectures • 100 practice essays';
    return '4 sections • 140 items each';
  };

  if (loading) {
    return (
      <GlassCard 
        className={`bg-gradient-to-br ${getGradientClass()} border-white/10`}
        variant="premium"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton w-10 h-10 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-16 rounded-lg" />
            <div className="skeleton h-16 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div 
      layout 
      className="w-full group"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <GlassCard 
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-br ${getGradientClass()} border-white/10 hover:border-white/20`}
        variant="premium"
        hover={false}
      >
        {/* Header Section with Progress Ring */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <motion.div 
              className={`p-2.5 rounded-xl ${badge.bg} flex-shrink-0 border border-white/10`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${color} mb-1 truncate`}>{category}</h3>
              <p className="text-xs text-neutral-400 mb-2 leading-tight">{getDescription()}</p>
              <motion.div 
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${badge.bg} border border-white/10`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {badge.icon}
                <span className={`text-xs ${badge.color} font-bold uppercase tracking-wider`}>
                  {badge.label}
                </span>
              </motion.div>
            </div>
          </div>
          
          {/* Compact Progress Ring */}
          <motion.div 
            className="relative w-10 h-10 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <motion.path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                className={badge.ring}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${progress.overall}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progress.overall}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-black ${badge.color}`}>{progress.overall}%</span>
            </div>
          </motion.div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span className="text-xs font-medium text-neutral-400">{labels.left}</span>
            </div>
            <div className={`text-xl font-black ${color}`}>{progress.lectures}%</div>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <FileText className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-neutral-400">{labels.right}</span>
            </div>
            <div className={`text-xl font-black ${color}`}>{progress.dpps}%</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-400">{labels.left}</span>
              <span className="text-xs font-medium text-indigo-400">{progress.lectures}%</span>
            </div>
            <div className="progress-bar h-1.5">
              <motion.div
                className="progress-fill h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress.lectures}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-neutral-400">{labels.right}</span>
              <span className="text-xs font-medium text-purple-400">{progress.dpps}%</span>
            </div>
            <div className="progress-bar h-1.5">
              <motion.div
                className="progress-fill h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress.dpps}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 border-t border-white/10 pt-3">
          <span>Click to explore</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </GlassCard>
    </motion.div>
  );
}