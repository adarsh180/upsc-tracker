'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Clock, Target, Award, Bell } from 'lucide-react';
import GlassCard from './GlassCard';

interface AdvancedAnalyticsProps {
  className?: string;
}

export default function AdvancedAnalytics({ className = '' }: AdvancedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>({
    performancePrediction: { score: 0, trend: 'stable' },
    weakAreas: [],
    studyPatterns: { consistency: 0, avgDailyHours: 0 },
    timeAllocation: [],
    achievements: [],
    reminders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/3"></div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Performance Prediction */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg md:text-xl font-semibold text-blue-400">Performance Prediction</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400">
              {analytics.performancePrediction.score}%
            </div>
            <div className="text-sm text-gray-400">Predicted Score</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-medium ${
              analytics.performancePrediction.trend === 'improving' ? 'text-green-400' :
              analytics.performancePrediction.trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {analytics.performancePrediction.trend}
            </div>
            <div className="text-sm text-gray-400">Trend</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-purple-400">
              {analytics.performancePrediction.confidence || 0}%
            </div>
            <div className="text-sm text-gray-400">Confidence</div>
          </div>
        </div>
      </GlassCard>

      {/* Weak Areas & Time Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Weak Areas</h3>
          </div>
          <div className="space-y-3">
            {analytics.weakAreas.slice(0, 3).map((area: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{area.subject}</div>
                  <div className="text-sm text-gray-400">{area.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-400">
                    {Math.round(area.progress)}%
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    area.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {area.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-400">Time Allocation</h3>
          </div>
          <div className="space-y-3">
            {analytics.timeAllocation.slice(0, 3).map((allocation: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{allocation.subject}</div>
                  <div className="text-sm text-gray-400">{allocation.reason}</div>
                </div>
                <div className="text-purple-400 font-medium">
                  {allocation.recommendedHours}h
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Study Patterns */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">Study Patterns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {analytics.studyPatterns.consistency}%
            </div>
            <div className="text-sm text-gray-400">Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {analytics.studyPatterns.avgDailyHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-400">Avg Daily Hours</div>
          </div>
        </div>
      </GlassCard>

      {/* Achievements & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Recent Achievements</h3>
          </div>
          <div className="space-y-3">
            {analytics.achievements.length > 0 ? (
              analytics.achievements.map((achievement: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="text-white">{achievement.message}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No recent achievements. Keep studying!
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-400">Study Reminders</h3>
          </div>
          <div className="space-y-3">
            {analytics.reminders.length > 0 ? (
              analytics.reminders.slice(0, 3).map((reminder: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    reminder.priority === 'high' ? 'bg-red-500/10 border-red-500/20' :
                    reminder.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="text-white text-sm">{reminder.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{reminder.type}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                All caught up! No reminders.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}