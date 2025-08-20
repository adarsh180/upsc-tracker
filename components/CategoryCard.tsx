'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Target } from 'lucide-react';
import GlassCard from './GlassCard';
import SubjectCard from './SubjectCard';
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
    if (overallProgress >= 80) return { icon: <Trophy className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (overallProgress >= 60) return { icon: <Star className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { icon: <Target className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const badge = getProgressBadge();

  return (
    <motion.div
      layout
      className="w-full"
    >
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
                stroke={color.replace('text-', '#')}
                strokeWidth="2"
                strokeDasharray={`${overallProgress}, 100`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${color}`}>{overallProgress}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${badge.bg} flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold ${color} mb-1 truncate`}>{category}</h3>
            <p className="text-sm text-gray-400">{subjects.length} subjects</p>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg} mt-2`}>
              {badge.icon}
              <span className={`text-xs ${badge.color} font-medium`}>
                {overallProgress >= 80 ? 'Expert' : overallProgress >= 60 ? 'Advanced' : 'Beginner'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className={`text-3xl font-bold ${color} mb-1`}>{lectureProgress}%</div>
            <div className="text-xs text-gray-400 leading-tight">
              Lectures<br/>
              <span className="text-white">{completedLectures}/{totalLectures}</span>
            </div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className={`text-3xl font-bold ${color} mb-1`}>{dppProgress}%</div>
            <div className="text-xs text-gray-400 leading-tight">
              DPPs<br/>
              <span className="text-white">{completedDpps}/{totalDpps}</span>
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
                  strokeDasharray={`${lectureProgress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${lectureProgress}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">{lectureProgress}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Lectures</div>
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
                  strokeDasharray={`${dppProgress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${dppProgress}, 100` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-purple-400">{dppProgress}%</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">DPPs</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}