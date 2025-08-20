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
    test_category: 'sectional' as 'sectional' | 'full-length' | 'mock' | 'subjective' | 'topic-wise',
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
              <h1 className="text-4xl font-bold gradient-text">Test Analytics</h1>
              <p className="text-gray-300 mt-2">Track your test performance and trends</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Test
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="text-center">
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{tests.length}</div>
            <div className="text-sm text-gray-300">Total Tests</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">
              {tests.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.percentage, 0) / chartData.length) : 0}%
            </div>
            <div className="text-sm text-gray-300">Avg Score</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              P
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {tests.filter(t => t.test_type === 'prelims').length}
            </div>
            <div className="text-sm text-gray-300">Prelims Tests</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              M
            </div>
            <div className="text-2xl font-bold text-red-400">
              {tests.filter(t => t.test_type === 'mains').length}
            </div>
            <div className="text-sm text-gray-300">Mains Tests</div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Charts */}
      {tests.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="attempt" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.values(categoryData)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avgScore" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Test Records */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Recent Tests</h3>
        {tests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No tests recorded yet. Add your first test to start tracking!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Percentage</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b border-white/10">
                    <td className="py-2">{new Date(test.attempt_date).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        test.test_type === 'prelims' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {test.test_type}
                      </span>
                    </td>
                    <td className="py-2 capitalize">{test.test_category}</td>
                    <td className="py-2">{test.subject}</td>
                    <td className="py-2">{test.scored_marks}/{test.total_marks}</td>
                    <td className="py-2">
                      <span className={`font-semibold ${
                        (parseFloat(test.scored_marks.toString()) / test.total_marks) * 100 >= 60 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {Math.round((parseFloat(test.scored_marks.toString()) / test.total_marks) * 100)}%
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Add Test Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4">{editingTest ? 'Edit Test Record' : 'Add New Test'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Test Type</label>
                  <select
                    value={formData.test_type}
                    onChange={(e) => setFormData({...formData, test_type: e.target.value as 'prelims' | 'mains'})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="prelims" className="bg-gray-800 text-white">Prelims</option>
                    <option value="mains" className="bg-gray-800 text-white">Mains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Category</label>
                  <select
                    value={formData.test_category}
                    onChange={(e) => setFormData({...formData, test_category: e.target.value as any})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="sectional" className="bg-gray-800 text-white">Sectional</option>
                    <option value="full-length" className="bg-gray-800 text-white">Full Length</option>
                    <option value="mock" className="bg-gray-800 text-white">Mock</option>
                    <option value="subjective" className="bg-gray-800 text-white">Subjective</option>
                    <option value="topic-wise" className="bg-gray-800 text-white">Topic-wise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                    placeholder="e.g., History, Polity"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">Total Marks</label>
                    <input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({...formData, total_marks: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">Scored Marks</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.scored_marks}
                      onChange={(e) => setFormData({...formData, scored_marks: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                      placeholder="75.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Date</label>
                  <input
                    type="date"
                    value={formData.attempt_date}
                    onChange={(e) => setFormData({...formData, attempt_date: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded transition-colors"
                  >
                    {editingTest ? 'Update Test' : 'Add Test'}
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