'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import GlassCard from '@/components/GlassCard';
import { TestRecord } from '@/types';

export default function TestsPage() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    test_type: 'prelims' as 'prelims' | 'mains',
    test_category: 'sectional' as 'sectional' | 'full-length' | 'mock' | 'subjective' | 'topic-wise' | 'ncert',
    subject: '',
    total_marks: '',
    scored_marks: '',
    attempt_date: new Date().toISOString().split('T')[0]
  });
  const [editingTest, setEditingTest] = useState<TestRecord | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await fetch('/api/tests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTest.id, ...formData })
        });
      } else {
        await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setShowAddForm(false);
      setEditingTest(null);
      setFormData({
        test_type: 'prelims',
        test_category: 'sectional',
        subject: '',
        total_marks: '',
        scored_marks: '',
        attempt_date: new Date().toISOString().split('T')[0]
      });
      fetchTests();
    } catch (error) {
      console.error('Failed to save test:', error);
    }
  };

  const handleEdit = (test: TestRecord) => {
    setEditingTest(test);
    setFormData({
      test_type: test.test_type,
      test_category: test.test_category,
      subject: test.subject,
      total_marks: test.total_marks.toString(),
      scored_marks: test.scored_marks.toString(),
      attempt_date: test.attempt_date.toString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this test record?')) {
      try {
        await fetch(`/api/tests?id=${id}`, { method: 'DELETE' });
        fetchTests();
      } catch (error) {
        console.error('Failed to delete test:', error);
      }
    }
  };

  const chartData = tests.map((test, index) => ({
    attempt: index + 1,
    score: parseFloat(test.scored_marks.toString()),
    percentage: (parseFloat(test.scored_marks.toString()) / test.total_marks) * 100,
    date: new Date(test.attempt_date).toLocaleDateString()
  }));

  const categoryData = tests.reduce((acc, test) => {
    const category = test.test_category;
    if (!acc[category]) acc[category] = { category, count: 0, avgScore: 0, totalScore: 0 };
    acc[category].count++;
    acc[category].totalScore += (parseFloat(test.scored_marks.toString()) / test.total_marks) * 100;
    acc[category].avgScore = acc[category].totalScore / acc[category].count;
    return acc;
  }, {} as Record<string, any>);

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
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
                  className="p-3 cursor-pointer bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-400/20 hover:border-indigo-400/30"
                  size="sm"
                >
                  <ArrowLeft className="w-5 h-5 text-indigo-400" />
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
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20">
                  <BarChart3 className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black gradient-text-primary tracking-tight">
                    Test Analytics
                  </h1>
                  <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                    Performance Tracking • Trend Analysis • Score Insights
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span>{tests.length} tests recorded • Live performance tracking</span>
              </motion.div>
            </div>
          </div>

          <motion.button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 hover:border-indigo-400/50 rounded-xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Plus className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="font-medium text-white">Add Test</span>
          </motion.button>
        </div>

        {/* Statistics Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="text-center bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border-indigo-400/20" size="sm">
            <BarChart3 className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <div className="text-3xl font-black text-indigo-400 mb-1">{tests.length}</div>
            <div className="text-xs text-neutral-400 font-medium">Total Tests</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-400/20" size="sm">
            <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-3xl font-black text-emerald-400 mb-1">
              {tests.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.percentage, 0) / chartData.length) : 0}%
            </div>
            <div className="text-xs text-neutral-400 font-medium">Average Score</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-400/20" size="sm">
            <div className="w-8 h-8 bg-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <div className="text-3xl font-black text-purple-400 mb-1">
              {tests.filter(t => t.test_type === 'prelims').length}
            </div>
            <div className="text-xs text-neutral-400 font-medium">Prelims Tests</div>
          </GlassCard>

          <GlassCard className="text-center bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-400/20" size="sm">
            <div className="w-8 h-8 bg-red-600 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div className="text-3xl font-black text-red-400 mb-1">
              {tests.filter(t => t.test_type === 'mains').length}
            </div>
            <div className="text-xs text-neutral-400 font-medium">Mains Tests</div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Enhanced Charts Section */}
      {tests.length > 0 && (
        <motion.div
          className="grid lg:grid-cols-2 gap-8 mb-12 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Performance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <GlassCard className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-400/20 hover:border-indigo-400/30 transition-all duration-500 group" variant="premium">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-400/20">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-400">Performance Trend</h3>
                    <p className="text-xs text-neutral-400">Score progression over time</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-400">Latest Score</div>
                  <div className="text-2xl font-black text-indigo-400">
                    {chartData.length > 0 ? Math.round(chartData[chartData.length - 1].percentage) : 0}%
                  </div>
                </div>
              </div>

              <div className="relative">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="rgba(99, 102, 241, 0.1)"
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="attempt"
                      stroke="#a1a1aa"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#a1a1aa"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(16px)'
                      }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      formatter={(value: any, name: string) => [
                        <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{Math.round(value)}%</span>,
                        'Score'
                      ]}
                      labelFormatter={(label) => `Test #${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="url(#performanceGradient)"
                      strokeWidth={3}
                      dot={{
                        fill: '#6366f1',
                        strokeWidth: 3,
                        stroke: '#1e293b',
                        r: 6,
                        filter: 'url(#glow)'
                      }}
                      activeDot={{
                        r: 8,
                        fill: '#6366f1',
                        stroke: '#1e293b',
                        strokeWidth: 3,
                        filter: 'url(#glow)'
                      }}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Animated overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Category Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <GlassCard className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-400/20 hover:border-purple-400/30 transition-all duration-500 group" variant="premium">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-400">Category Performance</h3>
                    <p className="text-xs text-neutral-400">Average scores by test type</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-400">Best Category</div>
                  <div className="text-lg font-black text-purple-400 capitalize">
                    {Object.values(categoryData).length > 0
                      ? Object.values(categoryData).reduce((best: any, current: any) =>
                        current.avgScore > best.avgScore ? current : best
                      ).category
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              <div className="relative">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={Object.values(categoryData)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.6} />
                      </linearGradient>
                      <filter id="barGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="rgba(139, 92, 246, 0.1)"
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="category"
                      stroke="#a1a1aa"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke="#a1a1aa"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'blur(16px)'
                      }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', textTransform: 'capitalize' }}
                      formatter={(value: any, name: string) => [
                        <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{Math.round(value)}%</span>,
                        'Average Score'
                      ]}
                    />
                    <Bar
                      dataKey="avgScore"
                      fill="url(#categoryGradient)"
                      radius={[8, 8, 0, 0]}
                      filter="url(#barGlow)"
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Animated overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State for Charts */}
      {tests.length === 0 && (
        <motion.div
          className="text-center py-16 mb-12 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-400/20">
            <div className="p-8">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mx-auto mb-6 flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <BarChart3 className="w-12 h-12 text-indigo-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400 mb-3">No Test Data Yet</h3>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                Start tracking your test performance by adding your first test result.
                Watch your progress unfold with beautiful analytics and insights.
              </p>
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 hover:border-indigo-400/50 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-white">Add Your First Test</span>
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Enhanced Test Records */}
      {tests.length > 0 && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <GlassCard className="bg-gradient-to-br from-neutral-500/5 to-gray-500/5 border-neutral-400/20" variant="premium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-neutral-500/20 to-gray-500/20 border border-neutral-400/20">
                  <BarChart3 className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-300">Test Records</h3>
                  <p className="text-xs text-neutral-400">Complete test history and performance data</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-400">Total Records</div>
                <div className="text-2xl font-black text-neutral-300">{tests.length}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Subject</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Score</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Percentage</th>
                    <th className="text-left py-4 px-2 text-sm font-semibold text-neutral-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => {
                    const percentage = Math.round((parseFloat(test.scored_marks.toString()) / test.total_marks) * 100);
                    return (
                      <motion.tr
                        key={test.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-all duration-300 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                            <span className="text-neutral-300 font-medium">
                              {new Date(test.attempt_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <motion.span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${test.test_type === 'prelims'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                              : 'bg-red-500/20 text-red-300 border-red-400/30'
                              }`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {test.test_type.toUpperCase()}
                          </motion.span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-neutral-300 capitalize font-medium">{test.test_category.replace('-', ' ')}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-neutral-300 font-medium">{test.subject}</span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-300 font-bold">{test.scored_marks}</span>
                            <span className="text-neutral-500">/</span>
                            <span className="text-neutral-400">{test.total_marks}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <motion.span
                              className={`font-bold text-lg ${percentage >= 80 ? 'text-emerald-400' :
                                percentage >= 60 ? 'text-yellow-400' :
                                  percentage >= 40 ? 'text-orange-400' : 'text-red-400'
                                }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.8 + index * 0.1, type: "spring", stiffness: 300 }}
                            >
                              {percentage}%
                            </motion.span>
                            <div className="w-16 h-2 bg-neutral-700 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-400' :
                                  percentage >= 60 ? 'bg-yellow-400' :
                                    percentage >= 40 ? 'bg-orange-400' : 'bg-red-400'
                                  }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 2.0 + index * 0.1, duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.button
                              onClick={() => handleEdit(test)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 hover:border-indigo-400/40 transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(test.id)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/40 transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Enhanced Add Test Modal */}
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
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-400/20"
              variant="premium"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingTest ? 'Edit Test Record' : 'Add New Test'}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {editingTest ? 'Update your test performance' : 'Record your test performance'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Test Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Test Type</label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => setFormData({ ...formData, test_type: e.target.value as 'prelims' | 'mains' })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    >
                      <option value="prelims" className="bg-gray-800 text-white">Prelims</option>
                      <option value="mains" className="bg-gray-800 text-white">Mains</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Category</label>
                    <select
                      value={formData.test_category}
                      onChange={(e) => setFormData({ ...formData, test_category: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    >
                      <option value="sectional" className="bg-gray-800 text-white">Sectional</option>
                      <option value="full-length" className="bg-gray-800 text-white">Full Length</option>
                      <option value="mock" className="bg-gray-800 text-white">Mock</option>
                      <option value="subjective" className="bg-gray-800 text-white">Subjective</option>
                      <option value="topic-wise" className="bg-gray-800 text-white">Topic-wise</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    placeholder="e.g., History, Polity, Geography"
                    required
                  />
                </div>

                {/* Marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Total Marks</label>
                    <input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Scored Marks</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.scored_marks}
                      onChange={(e) => setFormData({ ...formData, scored_marks: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                      placeholder="75.5"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Test Date</label>
                  <input
                    type="date"
                    value={formData.attempt_date}
                    onChange={(e) => setFormData({ ...formData, attempt_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400/50 focus:outline-none transition-all duration-200 hover:bg-white/10"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 hover:border-indigo-400/50 py-3 rounded-xl font-medium text-white transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingTest ? 'Update Test' : 'Add Test'}
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