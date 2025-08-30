'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Target, Clock, Award } from 'lucide-react';

interface ProgressData {
  date: string;
  hours: number;
  efficiency: number;
  topics: number;
  retention: number;
}

interface SubjectDistribution {
  subject: string;
  hours: number;
  color: string;
}

export default function AdvancedProgress() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectDistribution[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    // Generate mock data - replace with actual API calls
    const generateProgressData = () => {
      const data: ProgressData[] = [];
      const subjects: SubjectDistribution[] = [
        { subject: 'GS1', hours: 25, color: '#3B82F6' },
        { subject: 'GS2', hours: 30, color: '#10B981' },
        { subject: 'GS3', hours: 20, color: '#F59E0B' },
        { subject: 'GS4', hours: 15, color: '#EF4444' },
        { subject: 'Current Affairs', hours: 35, color: '#8B5CF6' },
        { subject: 'Optional', hours: 40, color: '#EC4899' }
      ];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.unshift({
          date: date.toISOString().split('T')[0],
          hours: Math.random() * 8 + 2,
          efficiency: Math.random() * 30 + 70,
          topics: Math.floor(Math.random() * 5) + 3,
          retention: Math.random() * 20 + 75
        });
      }

      setProgressData(data);
      setSubjectData(subjects);
    };

    generateProgressData();
  }, [timeframe]);

  const totalHours = subjectData.reduce((sum, subject) => sum + subject.hours, 0);
  const avgEfficiency = progressData.reduce((sum, day) => sum + day.efficiency, 0) / progressData.length;
  const totalTopics = progressData.reduce((sum, day) => sum + day.topics, 0);
  const avgRetention = progressData.reduce((sum, day) => sum + day.retention, 0) / progressData.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalHours}h</div>
          <div className="text-xs text-blue-300">This month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgEfficiency.toFixed(1)}%</div>
          <div className="text-xs text-green-300">Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Topics Covered</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalTopics}</div>
          <div className="text-xs text-purple-300">This month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-400/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-orange-300">Retention</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgRetention.toFixed(1)}%</div>
          <div className="text-xs text-orange-300">Average</div>
        </motion.div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'quarter'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === period
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Study Hours Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressData.slice(-14)}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#hoursGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Efficiency & Retention */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Efficiency %"
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Retention %"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="hours"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {subjectData.map((subject) => (
              <div key={subject.subject} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-neutral-300">{subject.subject}</span>
                <span className="text-xs text-neutral-500 ml-auto">{subject.hours}h</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Goals Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Goals</h3>
          <div className="space-y-4">
            {[
              { goal: 'Study 40 hours', progress: 32, target: 40, color: 'bg-blue-500' },
              { goal: 'Complete 50 topics', progress: 38, target: 50, color: 'bg-green-500' },
              { goal: 'Solve 200 questions', progress: 156, target: 200, color: 'bg-purple-500' },
              { goal: 'Write 3 essays', progress: 2, target: 3, color: 'bg-orange-500' }
            ].map((item, index) => {
              const percentage = (item.progress / item.target) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">{item.goal}</span>
                    <span className="text-neutral-400">{item.progress}/{item.target}</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500">
                    {percentage.toFixed(1)}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}