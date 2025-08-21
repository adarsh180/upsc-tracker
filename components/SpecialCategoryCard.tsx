'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target } from 'lucide-react';
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
    if (progress.overall >= 80) return { icon: <Trophy className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (progress.overall >= 60) return { icon: <Star className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { icon: <Target className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const badge = getProgressBadge();

  const getLabels = () => {
    if (category === 'CURRENT AFFAIRS') return { left: 'Topics', right: 'Progress' };
    if (category === 'ESSAY') return { left: 'Lectures', right: 'Essays' };
    return { left: 'Sections', right: 'Progress' };
  };

  const labels = getLabels();

  if (loading) {
    return (
      <GlassCard className="relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div layout className="w-full">
      <GlassCard className="relative overflow-hidden cursor-pointer">
        {/* Progress Ring Background */}
        <div className="absolute top-4 right-4">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke={color.includes('blue') ? '#3B82F6' : '#8B5CF6'}
                strokeWidth="2"
                strokeDasharray={`${progress.overall}, 100`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${color}`}>{progress.overall}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${badge.bg} flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold ${color} mb-1 truncate`}>{category}</h3>
            <p className="text-sm text-gray-400">
              {category === 'CURRENT AFFAIRS' ? '300 topics' : 
               category === 'ESSAY' ? '10 lectures + 100 essays' : 
               '4 sections × 140 items'}
            </p>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg} mt-2`}>
              {badge.icon}
              <span className={`text-xs ${badge.color} font-medium`}>
                {progress.overall >= 80 ? 'Expert' : progress.overall >= 60 ? 'Advanced' : 'Beginner'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className={`text-3xl font-bold ${color} mb-1`}>{progress.lectures}%</div>
            <div className="text-xs text-gray-400 leading-tight">
              {labels.left}
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className={`text-3xl font-bold ${color} mb-1`}>{progress.dpps}%</div>
            <div className="text-xs text-gray-400 leading-tight">
              {labels.right}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <motion.path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${progress.lectures}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progress.lectures}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">{progress.lectures}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">{labels.left}</div>
          </div>
          
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <motion.path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray={`${progress.dpps}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progress.dpps}, 100` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">{progress.dpps}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">{labels.right}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}