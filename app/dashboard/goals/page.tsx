'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, BookOpen, ArrowLeft, TrendingUp, Target, Award } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import GlassCard from '@/components/GlassCard';
import { DailyGoal } from '@/types';

// Helper function to get current IST date
function getCurrentISTDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentISTDate());
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    hours_studied: '',
    topics_covered: '',
    questions_solved: '',
    notes: ''
  });
  const [editingGoal, setEditingGoal] = useState<DailyGoal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [selectedDate]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/goals?date=${selectedDate}`);
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingGoal.id,
            subject: formData.subject,
            hours_studied: parseFloat(formData.hours_studied),
            topics_covered: parseInt(formData.topics_covered),
            notes: formData.notes
          })
        });
      } else {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            date: selectedDate,
            hours_studied: parseFloat(formData.hours_studied),
            topics_covered: parseInt(formData.topics_covered)
          })
        });
      }

      setShowAddForm(false);
      setEditingGoal(null);
      setFormData({ subject: '', hours_studied: '', topics_covered: '', questions_solved: '', notes: '' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleEdit = (goal: DailyGoal) => {
    setEditingGoal(goal);
    setFormData({
      subject: goal.subject,
      hours_studied: goal.hours_studied.toString(),
      topics_covered: goal.topics_covered.toString(),
      questions_solved: (goal.questions_solved || 0).toString(),
      notes: goal.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
        fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const totalHours = goals.reduce((sum, goal) => sum + parseFloat(goal.hours_studied.toString()), 0);
  const totalTopics = goals.reduce((sum, goal) => sum + goal.topics_covered, 0);

  const [analyticsData, setAnalyticsData] = useState<{
    daily: any[];
    weekly: any[];
    monthly: any[];
    lifetime: any;
  }>({
    daily: [],
    weekly: [],
    monthly: [],
    lifetime: { total_hours: 0, total_topics: 0, total_questions: 0, total_sessions: 0, study_days: 0 }
  });
  const [activeTab, setActiveTab] = useState('daily');

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/goals/analytics');
      const data = await response.json();
      setAnalyticsData({
        daily: data.daily.map((d: any) => ({
          ...d,
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })),
        weekly: data.weekly.map((w: any) => ({
          ...w,
          label: `W${w.week}`
        })),
        monthly: data.monthly.map((m: any) => {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            ...m,
            label: `${monthNames[m.month_num - 1]} ${m.year}`
          };
        }),
        lifetime: data.lifetime
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [goals.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <motion.div
        className="mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard
                  className="p-3 cursor-pointer bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-400/20 hover:border-emerald-400/30"
                  size="sm"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-400" />
                </GlassCard>
              </motion.div>
            </Link>

            <div className="flex-1">
              <motion.div
                className="flex items-center gap-4 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20">
                  <Calendar className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black gradient-text-success tracking-tight">
                    Daily Goals
                  </h1>
                  <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                    Study Sessions • Progress Tracking • Performance Analytics
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>{analyticsData.lifetime.study_days} study days • {analyticsData.lifetime.total_hours} total hours</span>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-400/50 focus:outline-none transition-colors"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            />
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 hover:border-emerald-400/50 rounded-xl transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Plus className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span className="font-medium text-white">Add Entry</span>
            </motion.button>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GlassCard className="text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{analyticsData.lifetime.total_hours}</div>
            <div className="text-sm text-gray-300">Total Hours</div>
          </GlassCard>

          <GlassCard className="text-center">
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{analyticsData.lifetime.total_topics}</div>
            <div className="text-sm text-gray-300">Total Topics</div>
          </GlassCard>

          <GlassCard className="text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{analyticsData.lifetime.total_questions}</div>
            <div className="text-sm text-gray-300">Questions Solved</div>
          </GlassCard>

          <GlassCard className="text-center">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{analyticsData.lifetime.study_days}</div>
            <div className="text-sm text-gray-300">Study Days</div>
          </GlassCard>

          <GlassCard className="text-center">
            <TrendingUp className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-400">{analyticsData.lifetime.total_sessions}</div>
            <div className="text-sm text-gray-300">Total Sessions</div>
          </GlassCard>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <GlassCard className="text-center">
            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-400">
              {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <div className="text-xs text-gray-300">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </GlassCard>

          <GlassCard className="text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">{totalHours.toFixed(1)}</div>
            <div className="text-xs text-gray-300">Today's Hours</div>
          </GlassCard>

          <GlassCard className="text-center">
            <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-400">{totalTopics}</div>
            <div className="text-xs text-gray-300">Today's Topics</div>
          </GlassCard>

          <GlassCard className="text-center">
            <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-yellow-400">{goals.length}</div>
            <div className="text-xs text-gray-300">Today's Sessions</div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Progress Analytics */}
      <GlassCard className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-blue-400">Progress Analytics</h3>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab
                    ? 'bg-blue-500/30 text-blue-400'
                    : 'bg-white/10 text-gray-400'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-4 text-green-400">Study Hours Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData[activeTab as keyof typeof analyticsData] || []}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'label' : 'label'}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
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
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4 text-purple-400">Topics & Questions Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData[activeTab as keyof typeof analyticsData] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey={activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'label' : 'label'}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="topics"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="questions"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* Enhanced Study Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <GlassCard className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-400/20">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-400">
                Study Sessions
              </h3>
              <p className="text-sm text-neutral-400">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {goals.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-300 mb-2">No Sessions Yet</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Start tracking your study progress for this date
              </p>
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add First Session
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-emerald-400/20 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-400 text-lg">{goal.subject}</h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {goal.hours_studied} hours
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {goal.topics_covered} topics
                          </span>
                          {goal.questions_solved && (
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {goal.questions_solved} questions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <motion.button
                        onClick={() => handleEdit(goal)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-sm transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(goal.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>

                  {goal.notes && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-neutral-300 text-sm leading-relaxed">{goal.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Enhanced Add Entry Modal */}
      {showAddForm && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAddForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard
              className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-400/20"
              variant="premium"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingGoal ? 'Edit Study Session' : 'Add Study Session'}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {editingGoal ? 'Update your study session details' : 'Record your daily study progress'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    placeholder="e.g., History, Polity, Economy, Geography"
                    required
                  />
                </div>

                {/* Hours and Topics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Hours Studied</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={formData.hours_studied}
                      onChange={(e) => setFormData({ ...formData, hours_studied: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                      placeholder="2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Topics Covered</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.topics_covered}
                      onChange={(e) => setFormData({ ...formData, topics_covered: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                {/* Questions Solved */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Questions Solved (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.questions_solved || ''}
                    onChange={(e) => setFormData({ ...formData, questions_solved: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    placeholder="50"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Study Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10 resize-none"
                    placeholder="What did you study today? Key insights, challenges, or achievements..."
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 hover:border-emerald-400/50 py-3 rounded-xl font-medium text-white transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingGoal ? 'Update Session' : 'Add Session'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-white/5 border border-white/20 hover:border-white/30 py-3 rounded-xl font-medium text-neutral-300 hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}