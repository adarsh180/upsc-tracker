'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Brain, X, Target, Clock, BookOpen, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import GlassCard from './GlassCard';

export default function PredictionCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    performancePrediction: { score: 0, trend: 'stable', confidence: 0, reasoning: '', recommendations: [] },
    weakAreas: [],
    studyPatterns: { consistency: 0, avgDailyHours: 0 },
    timeAllocation: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️';
      case 'declining': return '↘️';
      default: return '→';
    }
  };

  const getTrendDisplay = (trend: string) => {
    const icon = getTrendIcon(trend);
    return `${icon} ${trend}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Real-time data from database
  const trendData = analytics.realTimeData?.trendData || [];
  const subjectData = analytics.realTimeData?.subjectData || [];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

  if (!isExpanded) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
      >
        <GlassCard className="cursor-pointer bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-semibold text-blue-400">AI Prediction</h3>
                <p className="text-sm text-gray-400">Performance Analysis</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded animate-pulse w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${getScoreColor(analytics.performancePrediction?.score || 0)}`}>
                    {analytics.performancePrediction?.score || 0}%
                  </div>
                  <div className="text-sm text-gray-400">Predicted Score</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${getTrendColor(analytics.performancePrediction?.trend || 'stable')}`}>
                    {getTrendDisplay(analytics.performancePrediction?.trend || 'stable')}
                  </div>
                  <div className="text-sm text-gray-400">Trend</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.max(analytics.performancePrediction?.score || 0, 0), 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm text-purple-400">Progress: {Math.min(Math.max(analytics.performancePrediction?.score || 0, 0), 100)}%</span>
              </div>

              <div className="text-xs text-gray-400 bg-white/5 rounded p-2">
                Click to view detailed analysis with trends and recommendations
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setIsExpanded(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-7xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="bg-gradient-to-br from-gray-900/90 to-black/90">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-400" />
                <div>
                  <h2 className="text-3xl font-bold gradient-text">AI Performance Prediction</h2>
                  <p className="text-gray-300">Comprehensive UPSC preparation analysis</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-white/10 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Existing Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <GlassCard className="text-center">
                    <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">
                      {analytics.existingData?.overallProgress?.totalSubjects || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Subjects</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(analytics.existingData?.overallProgress?.totalStudyHours || 0)}
                    </div>
                    <div className="text-xs text-gray-400">Total Hours</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-400">
                      {analytics.existingData?.totalTests || 0}
                    </div>
                    <div className="text-xs text-gray-400">Tests Taken</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.round(analytics.existingData?.overallProgress?.avgTestScore || 0)}%
                    </div>
                    <div className="text-xs text-gray-400">Avg Score</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <TrendingUp className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">
                      {Math.round(analytics.existingData?.overallProgress?.avgSubjectProgress || 0)}%
                    </div>
                    <div className="text-xs text-gray-400">Avg Progress</div>
                  </GlassCard>
                </div>

                {/* AI Prediction Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <GlassCard className="text-center">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <div className={`text-3xl font-bold ${getScoreColor(analytics.performancePrediction?.score || 0)}`}>
                      {analytics.performancePrediction?.score || 0}%
                    </div>
                    <div className="text-sm text-gray-400">AI Predicted Score</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <TrendingUp className={`w-8 h-8 mx-auto mb-3 ${getTrendColor(analytics.performancePrediction?.trend || 'stable')}`} />
                    <div className={`text-xl font-bold ${getTrendColor(analytics.performancePrediction?.trend || 'stable')}`}>
                      {getTrendDisplay(analytics.performancePrediction?.trend || 'stable')}
                    </div>
                    <div className="text-sm text-gray-400">Performance Trend</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-purple-400">
                      {analytics.performancePrediction?.confidence || 0}%
                    </div>
                    <div className="text-sm text-gray-400">AI Confidence</div>
                  </GlassCard>

                  <GlassCard className="text-center">
                    <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-green-400">
                      {analytics.studyPatterns?.consistency || 0}%
                    </div>
                    <div className="text-sm text-gray-400">Study Consistency</div>
                  </GlassCard>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Trend */}
                  <GlassCard>
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
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
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorScore)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Subject Progress Pie Chart */}
                  <GlassCard>
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">Subject-wise Progress</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="progress"
                          label={({ subject, progress }) => `${subject}: ${progress}%`}
                        >
                          {subjectData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Study Hours Trend */}
                  <GlassCard>
                    <h3 className="text-xl font-semibold mb-4 text-green-400">Study Hours Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
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
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Topics Covered */}
                  <GlassCard>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">Topics Covered</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
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
                          dataKey="topics" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GlassCard>
                </div>

                {/* Weak Areas & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard>
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-semibold text-red-400">Areas Needing Attention</h3>
                    </div>
                    <div className="space-y-3">
                      {(analytics.weakAreas || []).slice(0, 5).map((area: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{area.subject}</div>
                            <div className="text-sm text-gray-400">{area.reason || area.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-400">
                              {area.progress}%
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
                      <BookOpen className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-blue-400">AI Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {analytics.performancePrediction?.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="text-white text-sm">{rec}</div>
                        </div>
                      )) || (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="text-white text-sm">Loading recommendations...</div>
                        </div>
                      )}
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-sm text-gray-300">
                          <strong className="text-blue-400">AI Analysis:</strong> {analytics.performancePrediction?.reasoning || 'Analyzing your preparation data...'}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}