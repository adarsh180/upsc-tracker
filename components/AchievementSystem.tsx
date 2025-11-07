'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';
import GlassCard from './GlassCard';

interface Achievement {
  id: number;
  name: string;
  description: string;
  badge_icon: string;
  criteria_type: string;
  criteria_value: number;
  points_reward: number;
  earned: boolean;
  earned_at?: string;
}

interface UserStats {
  total_points: number;
  current_level: string;
  streak_days: number;
  questions_solved: number;
  study_hours: number;
  tests_completed: number;
}

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_level: 'Iron',
    streak_days: 0,
    questions_solved: 0,
    study_hours: 0,
    tests_completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    fetchUserStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      setAchievements(data.data || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user-stats');
      const data = await response.json();
      setUserStats(data.data || userStats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iron': return 'text-gray-400';
      case 'Bronze': return 'text-orange-600';
      case 'Silver': return 'text-gray-300';
      case 'Gold': return 'text-yellow-400';
      case 'Platinum': return 'text-blue-400';
      case 'Diamond': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressToNextLevel = () => {
    const levels = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const thresholds = [0, 100, 300, 600, 1000, 1500];
    const currentIndex = levels.indexOf(userStats.current_level);
    
    if (currentIndex === levels.length - 1) return 100;
    
    const currentThreshold = thresholds[currentIndex];
    const nextThreshold = thresholds[currentIndex + 1];
    const progress = ((userStats.total_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-64 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Level Card */}
      <GlassCard className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/20">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Trophy className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold gradient-text-primary">Achievement Center</h3>
            <p className="text-sm text-neutral-400">Track your progress and earn rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getLevelColor(userStats.current_level)}`}>
              {userStats.current_level}
            </div>
            <div className="text-sm text-neutral-400 mb-4">Current Level</div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressToNextLevel()}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500">
              {userStats.total_points} points • {Math.round(getProgressToNextLevel())}% to next level
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-400">{userStats.streak_days}</div>
              <div className="text-xs text-neutral-400">Day Streak</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-400">{userStats.questions_solved}</div>
              <div className="text-xs text-neutral-400">Questions</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Star className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-400">{userStats.study_hours}h</div>
              <div className="text-xs text-neutral-400">Study Time</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-400">{userStats.tests_completed}</div>
              <div className="text-xs text-neutral-400">Tests</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Achievements Grid */}
      <GlassCard>
        <h4 className="text-xl font-semibold text-white mb-6">Achievements</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  {achievement.earned ? achievement.badge_icon : '🔒'}
                </div>
                <h5 className="font-semibold text-white mb-2">{achievement.name}</h5>
                <p className="text-sm text-neutral-300 mb-3">{achievement.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    achievement.earned ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {achievement.earned ? 'Earned' : 'Locked'}
                  </span>
                  <span className="text-yellow-400">+{achievement.points_reward} pts</span>
                </div>
                
                {achievement.earned && achievement.earned_at && (
                  <div className="text-xs text-neutral-500 mt-2">
                    Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}