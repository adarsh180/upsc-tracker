'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Zap, Star, Award } from 'lucide-react';
import GlassCard from './GlassCard';

interface GameStatsProps {
  totalLectures: number;
  totalDpps: number;
  totalRevisions: number;
  streak: number;
}

export default function GameStats({ totalLectures, totalDpps, totalRevisions, streak }: GameStatsProps) {
  const level = Math.floor((totalLectures + totalDpps) / 50) + 1;
  const xp = (totalLectures * 10) + (totalDpps * 15) + (totalRevisions * 5);
  const nextLevelXp = level * 500;
  const currentLevelXp = xp % 500;
  const xpProgress = (currentLevelXp / 500) * 100;

  const achievements = [
    { id: 'first_lecture', name: 'First Steps', icon: <Target className="w-4 h-4" />, unlocked: totalLectures >= 1 },
    { id: 'lecture_master', name: 'Lecture Master', icon: <Star className="w-4 h-4" />, unlocked: totalLectures >= 100 },
    { id: 'dpp_warrior', name: 'DPP Warrior', icon: <Zap className="w-4 h-4" />, unlocked: totalDpps >= 50 },
    { id: 'streak_keeper', name: 'Streak Keeper', icon: <Flame className="w-4 h-4" />, unlocked: streak >= 7 },
    { id: 'revision_king', name: 'Revision King', icon: <Award className="w-4 h-4" />, unlocked: totalRevisions >= 20 }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-yellow-400">Progress Stats</h3>
      </div>

      {/* Level & XP */}
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl font-bold text-yellow-400 mb-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Level {level}
        </motion.div>
        <div className="text-sm text-gray-400 mb-3">{xp.toLocaleString()} XP</div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-xs text-gray-400">
          {currentLevelXp}/{nextLevelXp} XP to next level
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{totalLectures}</div>
          <div className="text-xs text-gray-400">Lectures</div>
        </div>
        <div className="text-center p-3 bg-purple-500/10 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{totalDpps}</div>
          <div className="text-xs text-gray-400">DPPs</div>
        </div>
        <div className="text-center p-3 bg-green-500/10 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{totalRevisions}</div>
          <div className="text-xs text-gray-400">Revisions</div>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded-lg">
          <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {streak}
          </div>
          <div className="text-xs text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-300">Achievements ({unlockedAchievements.length}/{achievements.length})</h4>
        <div className="grid grid-cols-5 gap-2">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`p-2 rounded-lg text-center ${
                achievement.unlocked 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-700/50 text-gray-600'
              }`}
              whileHover={achievement.unlocked ? { scale: 1.1 } : undefined}
              title={achievement.name}
            >
              {achievement.icon}
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}