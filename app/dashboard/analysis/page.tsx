'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Clock, Target, Smile, Brain, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

interface AnalysisData {
  totalQuestions: number;
  totalHours: number;
  avgMoodPercent: number;
  weeklyData: any[];
  monthlyData: any[];
  lifetimeData: any;
  moodInsights: string;
  moodDistribution: any[];
}

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    totalQuestions: 0,
    totalHours: 0,
    avgMoodPercent: 0,
    weeklyData: [],
    monthlyData: [],
    lifetimeData: {},
    moodInsights: '',
    moodDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'lifetime'>('weekly');

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch('/api/analysis/detailed');
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      'happy': '😊',
      'excited': '🤩',
      'motivated': '💪',
      'confident': '😎',
      'neutral': '😐',
      'tired': '😴',
      'stressed': '😰',
      'frustrated': '😤',
      'sad': '😢',
      'anxious': '😟',
      'overwhelmed': '🤯',
      'bored': '😑'
    };
    return moodMap[mood.toLowerCase()] || '😐';
  };

  const getMoodColor = (mood: string) => {
    const colorMap: { [key: string]: string } = {
      'happy': '#10B981',
      'excited': '#F59E0B',
      'motivated': '#3B82F6',
      'confident': '#8B5CF6',
      'neutral': '#6B7280',
      'tired': '#EF4444',
      'stressed': '#DC2626',
      'frustrated': '#F97316',
      'sad': '#1E40AF',
      'anxious': '#7C2D12',
      'overwhelmed': '#BE123C',
      'bored': '#374151'
    };
    return colorMap[mood.toLowerCase()] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const currentData = activeTab === 'weekly' ? analysisData.weeklyData : 
                     activeTab === 'monthly' ? analysisData.monthlyData : 
                     [analysisData.lifetimeData];

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <GlassCard className="p-2 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </GlassCard>
          </Link>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Detailed Analysis</h1>
            <p className="text-gray-300 mt-2">Comprehensive study and mood analytics</p>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="text-center">
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-blue-400">{analysisData.totalQuestions}</div>
          <div className="text-sm text-gray-400">Total Questions Solved</div>
        </GlassCard>

        <GlassCard className="text-center">
          <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-green-400">{Math.round(analysisData.totalHours)}</div>
          <div className="text-sm text-gray-400">Total Hours Studied</div>
        </GlassCard>

        <GlassCard className="text-center">
          <Smile className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-yellow-400">{Math.round(analysisData.avgMoodPercent)}%</div>
          <div className="text-sm text-gray-400">Average Mood</div>
        </GlassCard>

        <GlassCard className="text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-purple-400">{analysisData.weeklyData.length}</div>
          <div className="text-sm text-gray-400">Active Weeks</div>
        </GlassCard>
      </div>

      {/* Time Period Tabs */}
      <div className="flex gap-2 mb-6">
        {(['weekly', 'monthly', 'lifetime'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab
                ? 'bg-blue-500/30 text-blue-400'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Study Hours Chart */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-green-400">Study Hours Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
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
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorHours)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Questions Solved Chart */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Questions Solved</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
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
                dataKey="questions" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Mood Trend Chart */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Mood Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
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
                dataKey="moodPercent" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Mood Distribution */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analysisData.moodDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ mood, count }) => `${getMoodEmoji(mood)} ${count}`}
              >
                {analysisData.moodDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={getMoodColor(entry.mood)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* AI Mood Insights */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-purple-400">AI Mood Insights</h3>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-gray-300 leading-relaxed">
            {analysisData.moodInsights || 'Analyzing your mood patterns to provide personalized insights...'}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}