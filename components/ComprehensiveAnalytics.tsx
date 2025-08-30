'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, Clock, BookOpen, Target,
    Award, Activity, BarChart3
} from 'lucide-react';
import GlassCard from './GlassCard';

interface AnalyticsData {
    daily: any[];
    weekly: any[];
    monthly: any[];
    subjects: any[];
    tests: any[];
    overall: any;
}

export default function ComprehensiveAnalytics() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        daily: [],
        weekly: [],
        monthly: [],
        subjects: [],
        tests: [],
        overall: {}
    });
    const [activeTimeframe, setActiveTimeframe] = useState('daily');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
        // Refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchAnalyticsData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const [subjectsRes, goalsRes, testsRes, analyticsRes] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/goals/analytics'),
                fetch('/api/tests'),
                fetch('/api/analytics/comprehensive')
            ]);

            const [subjects, goals, tests, comprehensive] = await Promise.all([
                subjectsRes.json(),
                goalsRes.json(),
                testsRes.json(),
                analyticsRes.json()
            ]);

            // Process data for charts
            const processedData = {
                daily: goals.daily || [],
                weekly: goals.weekly || [],
                monthly: goals.monthly || [],
                subjects: Array.isArray(subjects) ? subjects.map((s: any) => ({
                    name: s.subject,
                    completion: Math.round((s.completed_lectures / Math.max(s.total_lectures, 1)) * 100),
                    dppCompletion: Math.round((s.completed_dpps / Math.max(s.total_dpps, 1)) * 100),
                    category: s.category,
                    lectures: s.completed_lectures,
                    totalLectures: s.total_lectures,
                    dpps: s.completed_dpps,
                    totalDpps: s.total_dpps
                })) : [],
                tests: Array.isArray(tests) ? tests.map((t: any) => ({
                    subject: t.subject,
                    score: Math.round((t.scored_marks / Math.max(t.total_marks, 1)) * 100),
                    date: t.attempt_date,
                    type: t.test_type,
                    category: t.test_category
                })) : [],
                overall: comprehensive || {}
            };

            setAnalyticsData(processedData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

    if (loading) {
        return (
            <GlassCard className="animate-pulse">
                <div className="h-96 bg-white/5 rounded-xl" />
            </GlassCard>
        );
    }

    return (
        <div className="space-y-8">
            {/* Time-based Analytics */}
            <GlassCard className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-400/20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-blue-400 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7" />
                        Study Progress Trends
                    </h3>
                    <div className="flex gap-2">
                        {['daily', 'weekly', 'monthly'].map((timeframe) => (
                            <button
                                key={timeframe}
                                onClick={() => setActiveTimeframe(timeframe)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTimeframe === timeframe
                                        ? 'bg-blue-500/30 text-blue-400 border border-blue-400/30'
                                        : 'bg-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Study Hours Trend */}
                    <div>
                        <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Study Hours
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={analyticsData[activeTimeframe as keyof AnalyticsData] || []}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
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

                    {/* Topics Covered */}
                    <div>
                        <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Topics Covered
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData[activeTimeframe as keyof AnalyticsData] || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="topics"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Questions Practiced */}
                <div className="mt-8">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Questions Practiced
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData[activeTimeframe as keyof AnalyticsData] || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="questions" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Subject-wise Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subject Completion */}
                <GlassCard className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-400/20">
                    <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-3">
                        <BookOpen className="w-6 h-6" />
                        Subject Completion
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analyticsData.subjects} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="completion" fill="#10B981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* DPP Completion */}
                <GlassCard className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-400/20">
                    <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
                        <Activity className="w-6 h-6" />
                        DPP Completion
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analyticsData.subjects} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="dppCompletion" fill="#6366F1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Test Performance Analysis */}
            <GlassCard className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-400/20">
                <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    Test Performance Trends
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Test Scores Over Time */}
                    <div>
                        <h4 className="text-lg font-semibold text-pink-400 mb-4">Score Progression</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData.tests.slice(-10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        border: '1px solid rgba(236, 72, 153, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#EC4899"
                                    strokeWidth={3}
                                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Test Type Distribution */}
                    <div>
                        <h4 className="text-lg font-semibold text-purple-400 mb-4">Test Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Prelims', value: analyticsData.tests.filter(t => t.type === 'prelims').length },
                                        { name: 'Mains', value: analyticsData.tests.filter(t => t.type === 'mains').length }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[0, 1].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </GlassCard>

            {/* Overall Progress Radial Chart */}
            <GlassCard className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-400/20">
                <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6" />
                    Overall Progress Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Lectures Progress */}
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-blue-400 mb-4">Lectures</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{
                                name: 'Lectures',
                                value: analyticsData.subjects.reduce((sum, s) => sum + s.lectures, 0),
                                total: analyticsData.subjects.reduce((sum, s) => sum + s.totalLectures, 0)
                            }]}>
                                <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-neutral-400">
                            {analyticsData.subjects.reduce((sum, s) => sum + s.lectures, 0)} / {analyticsData.subjects.reduce((sum, s) => sum + s.totalLectures, 0)}
                        </p>
                    </div>

                    {/* DPPs Progress */}
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-green-400 mb-4">DPPs</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{
                                name: 'DPPs',
                                value: analyticsData.subjects.reduce((sum, s) => sum + s.dpps, 0),
                                total: analyticsData.subjects.reduce((sum, s) => sum + s.totalDpps, 0)
                            }]}>
                                <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-neutral-400">
                            {analyticsData.subjects.reduce((sum, s) => sum + s.dpps, 0)} / {analyticsData.subjects.reduce((sum, s) => sum + s.totalDpps, 0)}
                        </p>
                    </div>

                    {/* Tests Taken */}
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-purple-400 mb-4">Tests</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{
                                name: 'Tests',
                                value: analyticsData.tests.length,
                                total: 100 // Assuming target of 100 tests
                            }]}>
                                <RadialBar dataKey="value" cornerRadius={10} fill="#8B5CF6" />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-neutral-400">
                            {analyticsData.tests.length} / 100 tests
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}