'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, BookOpen, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/GlassCard';
import { DailyGoal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Generate last 7 days data for trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const [trendData, setTrendData] = useState<any[]>([]);

  const fetchTrendData = async () => {
    const data = await Promise.all(
      last7Days.map(async (date) => {
        try {
          const response = await fetch(`/api/goals?date=${date}`);
          const dayGoals = await response.json();
          const hours = dayGoals.reduce((sum: number, goal: DailyGoal) => sum + parseFloat(goal.hours_studied.toString()), 0);
          const topics = dayGoals.reduce((sum: number, goal: DailyGoal) => sum + goal.topics_covered, 0);
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours,
            topics
          };
        } catch {
          return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), hours: 0, topics: 0 };
        }
      })
    );
    setTrendData(data);
  };

  useEffect(() => {
    fetchTrendData();
  }, []);

  // Update trend data when goals change
  useEffect(() => {
    if (goals.length > 0) {
      fetchTrendData();
    }
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
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <GlassCard className="p-2 cursor-pointer hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5" />
              </GlassCard>
            </Link>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Daily Goals</h1>
              <p className="text-gray-300 mt-2">Track your daily study progress</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-2"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">
              {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-300">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-gray-300">Hours Studied</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{totalTopics}</div>
            <div className="text-sm text-gray-300">Topics Covered</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{goals.length}</div>
            <div className="text-sm text-gray-300">Study Sessions</div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Study Hours Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Topics Covered Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="topics" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Daily Entries */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">
          Study Sessions for {new Date(selectedDate).toLocaleDateString()}
        </h3>
        
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No study sessions recorded for this date. Add your first entry!
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-400">{goal.subject}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {goal.hours_studied}h
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {goal.topics_covered} topics
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {goal.notes && (
                  <p className="text-gray-300 text-sm">{goal.notes}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4">{editingGoal ? 'Edit Study Session' : 'Add Study Session'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
                    placeholder="e.g., History, Polity, Economy"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hours Studied</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hours_studied}
                    onChange={(e) => setFormData({...formData, hours_studied: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
                    placeholder="2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Topics Covered</label>
                  <input
                    type="number"
                    value={formData.topics_covered}
                    onChange={(e) => setFormData({...formData, topics_covered: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
                    placeholder="5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Questions Solved</label>
                  <input
                    type="number"
                    value={formData.questions_solved || ''}
                    onChange={(e) => setFormData({...formData, questions_solved: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 h-20 resize-none"
                    placeholder="What did you study today?"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded transition-colors"
                  >
                    {editingGoal ? 'Update Session' : 'Add Session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}