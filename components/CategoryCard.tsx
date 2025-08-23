'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Target, BookOpen, FileText, TrendingUp, Award } from 'lucide-react';
import GlassCard from './GlassCard';
import { SubjectProgress } from '@/types';
import { calculateProgress } from '@/lib/utils';

interface CategoryCardProps {
  category: string;
  subjects: SubjectProgress[];
  onUpdate: (id: number, field: string, value: number) => void;
  icon: React.ReactNode;
  color: string;
}

export default function CategoryCard({ category, subjects, onUpdate, icon, color }: CategoryCardProps) {
  
  const totalLectures = subjects.reduce((sum, s) => sum + s.total_lectures, 0);
  const completedLectures = subjects.reduce((sum, s) => sum + s.completed_lectures, 0);
  const totalDpps = subjects.reduce((sum, s) => sum + s.total_dpps, 0);
  const completedDpps = subjects.reduce((sum, s) => sum + s.completed_dpps, 0);
  
  const lectureProgress = calculateProgress(completedLectures, totalLectures);
  const dppProgress = calculateProgress(completedDpps, totalDpps);
  const overallProgress = Math.round((lectureProgress + dppProgress) / 2);

  const getProgressBadge = () => {
    if (overallProgress >= 90) return { 
      icon: <Award className="w-4 h-4" />, 
      color: 'text-yellow-300', 
      bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      label: 'Master',
      ring: 'stroke-yellow-400'
    };
    if (overallProgress >= 75) return { 
      icon: <Trophy className="w-4 h-4" />, 
      color: 'text-emerald-300', 
      bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      label: 'Expert',
      ring: 'stroke-emerald-400'
    };
    if (overallProgress >= 50) return { 
      icon: <Star className="w-4 h-4" />, 
      color: 'text-indigo-300', 
      bg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      label: 'Advanced',
      ring: 'stroke-indigo-400'
    };
    return { 
      icon: <Target className="w-4 h-4" />, 
      color: 'text-neutral-400', 
      bg: 'bg-gradient-to-r from-neutral-500/20 to-gray-500/20',
      label: 'Beginner',
      ring: 'stroke-neutral-400'
    };
  };

  const badge = getProgressBadge();

  const getGradientClass = () => {
    if (color.includes('blue')) return 'from-blue-500/10 to-indigo-500/5';
    if (color.includes('indigo')) return 'from-indigo-500/10 to-purple-500/5';
    if (color.includes('purple')) return 'from-purple-500/10 to-pink-500/5';
    return 'from-blue-500/10 to-indigo-500/5';
  };

  return (
    <motion.div
      layout
      className="w-full group"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <GlassCard 
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-br ${getGradientClass()} border-white/10 hover:border-white/20`}
        variant="premium"
        hover={false}
      >
        {/* Floating Progress Ring */}
        <div className="absolute top-6 right-6 z-20">
          <motion.div 
            className="relative w-16 h-16"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2.5"
              />
              <motion.path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                className={badge.ring}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${overallProgress}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-black ${badge.color}`}>{overallProgress}%</span>
            </div>
          </motion.div>
        </div>

        {/* Header Section */}
        <div className="flex items-start gap-4 mb-8 relative z-10">
          <motion.div 
            className={`p-4 rounded-2xl ${badge.bg} flex-shrink-0 border border-white/10`}
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-2xl font-black ${color} mb-2 truncate`}>{category}</h3>
            <p className="text-sm text-neutral-400 mb-3">{subjects.length} subjects • {totalLectures + totalDpps} total items</p>
            <motion.div 
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} border border-white/10`}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div 
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Lectures</span>
            </div>
            <div className={`text-3xl font-black ${color} mb-1`}>{lectureProgress}%</div>
            <div className="text-xs text-neutral-500">
              <span className="text-white font-medium">{completedLectures}</span> of <span className="text-white font-medium">{totalLectures}</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">DPPs</span>
            </div>
            <div className={`text-3xl font-black ${color} mb-1`}>{dppProgress}%</div>
            <div className="text-xs text-neutral-500">
              <span className="text-white font-medium">{completedDpps}</span> of <span className="text-white font-medium">{totalDpps}</span>
            </div>
          </motion.div>
        </div>

        {/* Progress Visualization */}
        <div className="flex justify-center gap-12">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                <motion.path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="url(#lectureGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${lectureProgress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${lectureProgress}, 100` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                />
                <defs>
                  <linearGradient id="lectureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-400">{lectureProgress}%</span>
              </div>
            </div>
            <div className="text-xs text-neutral-400 font-medium">Lectures</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                <motion.path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="url(#dppGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${dppProgress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${dppProgress}, 100` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                />
                <defs>
                  <linearGradient id="dppGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">{dppProgress}%</span>
              </div>
            </div>
            <div className="text-xs text-neutral-400 font-medium">DPPs</div>
          </motion.div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </GlassCard>
    </motion.div>
  );
}