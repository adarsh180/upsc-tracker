'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Target, Clock, Brain } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlassCard from './GlassCard';

interface AnalyticsData {
  studyHours: { date: string; hours: number; }[];
  subjectProgress: { subject: string; completion: number; color: string; }[];
  weeklyPerformance: { week: string; tests: number; accuracy: number; }[];
  moodCorrelation: { mood: string; productivity: number; count: number; }[];
  timeDistribution: { hour: number; sessions: number; }[];
  streakData: { date: string; active: boolean; }[];
}

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?days=${timeRange}`);
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics({
        studyHours: [],
        subjectProgress: [],
        weeklyPerformance: [],
        moodCorrelation: [],
        timeDistribution: [],
        streakData: []
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-96 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold gradient-text-primary">Advanced Analytics</h3>
              <p className="text-sm text-neutral-400">Comprehensive performance insights</p>
            </div>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-400/50 focus:outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Study Hours Trend */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily Study Hours Trend
          </h4>
          <div className="h-64 bg-white/5 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.studyHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Progress & Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subject Progress */}
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Subject-wise Progress
            </h4>
            <div className="h-64 bg-white/5 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.subjectProgress}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="completion"
                    label={({ subject, completion }) => `${subject}: ${completion}%`}
                  >
                    {analytics.subjectProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Performance */}
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Test Performance
            </h4>
            <div className="h-64 bg-white/5 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="accuracy" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Mood vs Productivity Correlation */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Mood vs Productivity Correlation
          </h4>
          <div className="h-64 bg-white/5 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.moodCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mood" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="productivity" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Distribution */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Optimal Study Hours Analysis
          </h4>
          <div className="h-64 bg-white/5 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sessions" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30 rounded-xl p-4">
            <h5 className="text-green-400 font-medium mb-2">Best Performance Day</h5>
            <p className="text-2xl font-bold text-white">
              {analytics.weeklyPerformance.length > 0 
                ? analytics.weeklyPerformance.reduce((best, current) => 
                    current.accuracy > best.accuracy ? current : best
                  ).week
                : 'N/A'
              }
            </p>
            <p className="text-xs text-neutral-400">
              {analytics.weeklyPerformance.length > 0 
                ? Math.round(analytics.weeklyPerformance.reduce((best, current) => 
                    current.accuracy > best.accuracy ? current : best
                  ).accuracy)
                : 0
              }% accuracy
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/30 rounded-xl p-4">
            <h5 className="text-blue-400 font-medium mb-2">Peak Study Hour</h5>
            <p className="text-2xl font-bold text-white">
              {analytics.timeDistribution.length > 0 
                ? `${analytics.timeDistribution.reduce((peak, current) => 
                    current.sessions > peak.sessions ? current : peak
                  ).hour}:00`
                : 'N/A'
              }
            </p>
            <p className="text-xs text-neutral-400">
              {analytics.timeDistribution.length > 0 
                ? analytics.timeDistribution.reduce((peak, current) => 
                    current.sessions > peak.sessions ? current : peak
                  ).sessions
                : 0
              } sessions
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/30 rounded-xl p-4">
            <h5 className="text-purple-400 font-medium mb-2">Most Productive Mood</h5>
            <p className="text-2xl font-bold text-white capitalize">
              {analytics.moodCorrelation.length > 0 
                ? analytics.moodCorrelation.reduce((best, current) => 
                    current.productivity > best.productivity ? current : best
                  ).mood
                : 'N/A'
              }
            </p>
            <p className="text-xs text-neutral-400">
              {analytics.moodCorrelation.length > 0 
                ? Math.round(analytics.moodCorrelation.reduce((best, current) => 
                    current.productivity > best.productivity ? current : best
                  ).productivity)
                : 0
              }% productivity
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-4">
            <h5 className="text-yellow-400 font-medium mb-2">Current Streak</h5>
            <p className="text-2xl font-bold text-white">
              {analytics.streakData.filter(d => d.active).length}
            </p>
            <p className="text-xs text-neutral-400">consecutive days</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}