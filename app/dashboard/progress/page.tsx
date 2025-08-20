'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowLeft, Calendar, Target, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import GlassCard from '@/components/GlassCard';

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<{
    totalStudyHours: number;
    completedTopics: number;
    testsTaken: number;
    totalQuestions: number;
    currentStreak: number;
    weeklyProgress: any[];
    monthlyTrend: any[];
    subjectProgress: any[];
  }>({
    totalStudyHours: 0,
    completedTopics: 0,
    testsTaken: 0,
    totalQuestions: 0,
    currentStreak: 0,
    weeklyProgress: [],
    monthlyTrend: [],
    subjectProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
    const interval = setInterval(fetchProgressData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      setProgressData({
        totalStudyHours: Math.round(data?.analytics?.totalStudyHours || 0),
        completedTopics: data?.analytics?.completedTopics || 0,
        testsTaken: data?.analytics?.testsTaken || 0,
        totalQuestions: data?.analytics?.totalQuestions || 0,
        currentStreak: data?.analytics?.currentStreak || 0,
        weeklyProgress: data?.trends?.weekly?.length > 0 ? data.trends.weekly.map((w: any) => ({
          day: new Date(w.day).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: w.hours || 0,
          questions: w.questions || 0
        })) : [
          { day: 'Mon', hours: 0, questions: 0 },
          { day: 'Tue', hours: 0, questions: 0 },
          { day: 'Wed', hours: 0, questions: 0 },
          { day: 'Thu', hours: 0, questions: 0 },
          { day: 'Fri', hours: 0, questions: 0 },
          { day: 'Sat', hours: 0, questions: 0 },
          { day: 'Sun', hours: 0, questions: 0 }
        ],
        monthlyTrend: data?.trends?.monthly?.length > 0 ? data.trends.monthly.map((m: any) => ({
          month: m.month,
          hours: m.hours || 0,
          topics: m.topics || 0,
          questions: m.questions || 0
        })) : [
          { month: 'Jan', hours: 0, topics: 0, questions: 0 },
          { month: 'Feb', hours: 0, topics: 0, questions: 0 },
          { month: 'Mar', hours: 0, topics: 0, questions: 0 }
        ],
        subjectProgress: (data?.subjects || []).slice(0, 6).map((s: any) => ({
          subject: s.subject,
          progress: Math.round(((s.completed_lectures + s.completed_dpps) / (s.total_lectures + s.total_dpps)) * 100)
        }))
      });
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <GlassCard className="p-2 cursor-pointer hover:scale-105 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </GlassCard>
          </Link>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Progress Analytics</h1>
            <p className="text-gray-300 mt-2">Comprehensive insights into your UPSC preparation</p>
          </div>
        </div>
      </motion.div>

      {/* Circular Progress Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Study Hours', value: progressData.totalStudyHours, max: 300, color: '#3B82F6', icon: BookOpen },
          { label: 'Topics Done', value: progressData.completedTopics, max: 200, color: '#10B981', icon: Target },
          { label: 'Tests Taken', value: progressData.testsTaken, max: 50, color: '#F59E0B', icon: Award },
          { label: 'Day Streak', value: progressData.currentStreak, max: 30, color: '#EF4444', icon: Calendar }
        ].map((stat, index) => {
          const percentage = Math.min((stat.value / stat.max) * 100, 100);
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="2"
                    strokeDasharray={`${percentage}, 100`}
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${percentage}, 100` }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
                  <span className="text-lg font-bold text-white">{stat.value}</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% of target</div>
            </GlassCard>
          );
        })}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Study Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Weekly Study Pattern</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData.weeklyProgress}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorHours)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Monthly Progress Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Monthly Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="topics" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Subject Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard>
          <h3 className="text-xl font-semibold mb-6 text-green-400">Subject-wise Progress</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.subjectProgress.map((subject, index) => (
              <div key={subject.subject} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
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
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeDasharray={`${subject.progress}, 100`}
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${subject.progress}, 100` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{subject.progress}%</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-white">{subject.subject}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}