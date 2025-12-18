'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, TrendingUp, TrendingDown, ArrowLeft, FileText, Target,
    Award, CheckCircle, X, Calendar, Star, BookOpen, ExternalLink, ChevronRight, Layers
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { TestRecord } from '@/types';

// Circular Progress for Growth
const CircularProgress = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(Math.abs(value) / max, 1);
    const strokeDashoffset = circumference - percentage * circumference;

    return (
        <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="5" fill="none" />
            <motion.circle
                cx="24"
                cy="24"
                r={radius}
                stroke={color}
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 24 24)"
            />
        </svg>
    );
};

export default function TestDataPage() {
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'prelims' | 'mains'>('all');
    const [chartType, setChartType] = useState<'area' | 'line'>('area');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [formData, setFormData] = useState({
        test_type: 'prelims' as 'prelims' | 'mains',
        test_category: 'sectional' as 'sectional' | 'full-length' | 'ncert',
        subject: '',
        total_marks: '200',
        scored_marks: '',
        attempt_date: new Date().toISOString().split('T')[0]
    });
    const [editingTest, setEditingTest] = useState<TestRecord | null>(null);
    const [showTestSeries, setShowTestSeries] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<'ksg' | 'vision' | null>(null);

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        if (formData.test_type === 'prelims') {
            setFormData(prev => ({ ...prev, total_marks: '200' }));
        } else if (formData.test_type === 'mains') {
            if (formData.test_category === 'full-length') {
                setFormData(prev => ({ ...prev, total_marks: '250' }));
            } else {
                if (formData.total_marks === '200' || formData.total_marks === '250') {
                    setFormData(prev => ({ ...prev, total_marks: '' }));
                }
            }
        }
    }, [formData.test_type, formData.test_category]);

    const fetchTests = async () => {
        try {
            const response = await fetch('/api/tests');
            const data = await response.json();
            setTests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                total_marks: parseInt(formData.total_marks),
                scored_marks: parseFloat(formData.scored_marks)
            };

            if (editingTest) {
                await fetch('/api/tests', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingTest.id, ...payload })
                });
            } else {
                await fetch('/api/tests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            setShowAddForm(false);
            setEditingTest(null);
            setFormData({
                test_type: 'prelims',
                test_category: 'sectional',
                subject: '',
                total_marks: '200',
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
            test_category: test.test_category as 'sectional' | 'full-length' | 'ncert',
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

    const isTotalMarksDisabled = () => {
        if (formData.test_type === 'prelims') return true;
        if (formData.test_type === 'mains' && formData.test_category === 'full-length') return true;
        return false;
    };

    const prelimsTests = tests.filter(t => t.test_type === 'prelims');
    const mainsTests = tests.filter(t => t.test_type === 'mains');

    const getFilteredTests = (testList: TestRecord[]) => {
        if (categoryFilter === 'all') return testList;
        return testList.filter(t => t.test_category === categoryFilter);
    };

    const filteredPrelimsTests = getFilteredTests(prelimsTests);
    const filteredMainsTests = getFilteredTests(mainsTests);
    const filteredTests = activeTab === 'all' ? tests : activeTab === 'prelims' ? prelimsTests : mainsTests;

    const getChartData = (testList: TestRecord[]) => {
        return testList.map((test, index) => ({
            name: `Test ${index + 1}`,
            score: parseFloat(test.scored_marks.toString()),
            percentage: (parseFloat(test.scored_marks.toString()) / test.total_marks) * 100,
            date: new Date(test.attempt_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
            subject: test.subject
        }));
    };

    const getTestStats = (testList: TestRecord[]) => {
        if (testList.length === 0) return null;

        const sortedTests = [...testList].sort((a, b) =>
            new Date(a.attempt_date).getTime() - new Date(b.attempt_date).getTime()
        );

        const firstTest = sortedTests[0];
        const latestTest = sortedTests[sortedTests.length - 1];

        const firstScore = parseFloat(firstTest.scored_marks.toString());
        const latestScore = parseFloat(latestTest.scored_marks.toString());
        const firstPercentage = (firstScore / firstTest.total_marks) * 100;
        const latestPercentage = (latestScore / latestTest.total_marks) * 100;
        const growth = latestScore - firstScore;
        const growthPercentage = firstScore > 0 ? ((latestScore - firstScore) / firstScore) * 100 : 0;

        return {
            first: { score: firstScore, percentage: firstPercentage, date: new Date(firstTest.attempt_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) },
            latest: { score: latestScore, percentage: latestPercentage, date: new Date(latestTest.attempt_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) },
            growth,
            growthPercentage
        };
    };

    const getAveragePercentage = (testList: TestRecord[]) => {
        if (testList.length === 0) return 0;
        const total = testList.reduce((sum, test) =>
            sum + (parseFloat(test.scored_marks.toString()) / test.total_marks) * 100, 0);
        return total / testList.length;
    };

    const prelimsChartData = getChartData(filteredPrelimsTests);
    const mainsChartData = getChartData(filteredMainsTests);
    const prelimsStats = getTestStats(filteredPrelimsTests);
    const mainsStats = getTestStats(filteredMainsTests);

    const filterTabs = ['all', 'sectional', 'full-length', 'ncert'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f23 100%)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // Performance Analytics Card Component
    const PerformanceAnalyticsCard = ({
        title,
        chartData,
        stats,
        accentColor,
        gradientId
    }: {
        title: string;
        chartData: any[];
        stats: any;
        accentColor: string;
        gradientId: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            {/* Main Card */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, #12121f 0%, #0d0d1a 100%)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${accentColor}20` }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold" style={{ color: accentColor }}>{title}</span>
                    </div>

                    {/* Chart Type Toggle */}
                    <div className="flex rounded-lg overflow-hidden" style={{ background: '#1a1a2e' }}>
                        <button
                            onClick={() => setChartType('area')}
                            className={`px-4 py-2 text-sm font-medium transition-all ${chartType === 'area'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Area
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 text-sm font-medium transition-all ${chartType === 'line'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Line
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setCategoryFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === tab
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-gray-500 hover:text-gray-300 border border-transparent'
                                }`}
                        >
                            {tab === 'all' ? 'All Tests' : tab === 'full-length' ? 'Full Length' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="px-4 pb-2">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            {chartType === 'area' ? (
                                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={accentColor} stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="0" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#4a5568"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#4a5568"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                                        }}
                                        labelStyle={{ color: '#9ca3af' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => [`${value.toFixed(1)}%`, 'Score']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke={accentColor}
                                        strokeWidth={2}
                                        fill={`url(#${gradientId})`}
                                    />
                                </AreaChart>
                            ) : (
                                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="0" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#4a5568"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#4a5568"
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                                        }}
                                        labelStyle={{ color: '#9ca3af' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => [`${value.toFixed(1)}%`, 'Score']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke={accentColor}
                                        strokeWidth={3}
                                        dot={{ fill: accentColor, strokeWidth: 2, stroke: '#0d0d1a', r: 5 }}
                                        activeDot={{ r: 7, fill: accentColor, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[320px] flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No test data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-2">
                        {/* First Test */}
                        <div
                            className="rounded-xl p-5"
                            style={{ background: '#151520', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>First Test</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-white">{Math.round(stats.first.score)}</span>
                                <span className="w-3 h-3 rounded-full bg-amber-500" />
                            </div>
                            <div className="text-gray-500 text-sm mt-2">
                                {stats.first.percentage.toFixed(1)}% • {stats.first.date}
                            </div>
                        </div>

                        {/* Latest Test */}
                        <div
                            className="rounded-xl p-5"
                            style={{ background: '#151520', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2 text-sm mb-3" style={{ color: accentColor }}>
                                <Star className="w-4 h-4" />
                                <span>Latest Test</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-white">{Math.round(stats.latest.score)}</span>
                                <span className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
                            </div>
                            <div className="text-gray-500 text-sm mt-2">
                                {stats.latest.percentage.toFixed(1)}% • {stats.latest.date}
                            </div>
                        </div>

                        {/* Growth */}
                        <div
                            className="rounded-xl p-5"
                            style={{ background: '#151520', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                {stats.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>Growth</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className={`text-3xl font-bold ${stats.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stats.growth >= 0 ? '+' : ''}{Math.round(stats.growth)}
                                    </span>
                                    <div className={`text-sm mt-2 ${stats.growth >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                                        {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage.toFixed(1)}% change
                                    </div>
                                </div>
                                <CircularProgress
                                    value={Math.abs(stats.growthPercentage)}
                                    color={stats.growth >= 0 ? '#10b981' : '#ef4444'}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-8"
            style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f23 100%)' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                    style={{ background: '#151520', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                                </motion.div>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Test Analytics</h1>
                                <p className="text-gray-500 text-sm">Track your Prelims & Mains performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={() => setShowTestSeries(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all text-sm"
                                style={{ background: '#151520', border: '1px solid rgba(255,255,255,0.15)' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Layers className="w-4 h-4 text-purple-400" />
                                Test Series
                            </motion.button>
                            <motion.button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-white transition-all text-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Test
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Quick Stats */}
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {[
                        { label: 'Total Tests', value: tests.length, color: '#6366f1' },
                        { label: 'Prelims', value: prelimsTests.length, color: '#8b5cf6' },
                        { label: 'Mains', value: mainsTests.length, color: '#ef4444' },
                        { label: 'Avg Score', value: `${tests.length > 0 ? Math.round(getAveragePercentage(tests)) : 0}%`, color: '#10b981' }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl p-4"
                            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="text-gray-500 text-xs mb-1">{stat.label}</div>
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {tests.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div
                            className="rounded-2xl p-10 max-w-md mx-auto"
                            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 mx-auto mb-5 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Tests Yet</h3>
                            <p className="text-gray-500 text-sm mb-6">Add your first test to start tracking performance</p>
                            <motion.button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-white transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Test
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Prelims Analytics */}
                {prelimsTests.length > 0 && (
                    <PerformanceAnalyticsCard
                        title="Prelims Performance Analytics"
                        chartData={prelimsChartData}
                        stats={prelimsStats}
                        accentColor="#8b5cf6"
                        gradientId="prelimsGradient"
                    />
                )}

                {/* Mains Analytics */}
                {mainsTests.length > 0 && (
                    <PerformanceAnalyticsCard
                        title="Mains Performance Analytics"
                        chartData={mainsChartData}
                        stats={mainsStats}
                        accentColor="#ef4444"
                        gradientId="mainsGradient"
                    />
                )}

                {/* Test History Table */}
                {tests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            {/* Table Header */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-500" />
                                    <h3 className="text-base font-semibold text-white">Test History</h3>
                                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-md">{filteredTests.length}</span>
                                </div>
                                <div className="flex rounded-lg overflow-hidden" style={{ background: '#1a1a2e' }}>
                                    {(['all', 'prelims', 'mains'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === tab
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Date', 'Type', 'Category', 'Subject', 'Score', '%', 'Actions'].map((h) => (
                                                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTests.map((test, i) => {
                                            const pct = Math.round((parseFloat(test.scored_marks.toString()) / test.total_marks) * 100);
                                            const good = test.test_type === 'prelims' ? pct >= 70 : pct >= 60;
                                            return (
                                                <motion.tr
                                                    key={test.id}
                                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.02 }}
                                                >
                                                    <td className="py-3 px-4 text-gray-400 text-sm">
                                                        {new Date(test.attempt_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${test.test_type === 'prelims' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {test.test_type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-400 text-sm capitalize">{test.test_category.replace('-', ' ')}</td>
                                                    <td className="py-3 px-4 text-white text-sm">{test.subject}</td>
                                                    <td className="py-3 px-4 text-gray-400 text-sm">{test.scored_marks}/{test.total_marks}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold ${good ? 'text-emerald-400' : 'text-amber-400'}`}>{pct}%</span>
                                                            <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className={`h-full ${good ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ delay: 0.2, duration: 0.5 }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEdit(test)} className="text-xs px-2 py-1 text-blue-400 hover:bg-blue-500/10 rounded">Edit</button>
                                                            <button onClick={() => handleDelete(test.id)} className="text-xs px-2 py-1 text-red-400 hover:bg-red-500/10 rounded">Delete</button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowAddForm(false); setEditingTest(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md rounded-2xl overflow-hidden"
                            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-base font-semibold text-white">{editingTest ? 'Edit Test' : 'Add Test'}</span>
                                </div>
                                <button onClick={() => { setShowAddForm(false); setEditingTest(null); }} className="p-1.5 rounded-lg hover:bg-white/5">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Type */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['prelims', 'mains'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, test_type: t })}
                                                className={`py-2.5 rounded-lg text-sm font-medium transition-all ${formData.test_type === t
                                                    ? t === 'prelims' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'
                                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                                    }`}
                                            >
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">Category</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['sectional', 'full-length', 'ncert'] as const).map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, test_category: c })}
                                                className={`py-2.5 rounded-lg text-xs font-medium transition-all ${formData.test_category === c
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                                    }`}
                                            >
                                                {c === 'full-length' ? 'Full Length' : c.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">Subject</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., History, Polity"
                                        required
                                    />
                                </div>

                                {/* Marks */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">
                                            Total {isTotalMarksDisabled() && <span className="text-blue-400">(Auto)</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.total_marks}
                                            onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                                            className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none ${isTotalMarksDisabled() ? 'opacity-50' : ''}`}
                                            disabled={isTotalMarksDisabled()}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">Score</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.scored_marks}
                                            onChange={(e) => setFormData({ ...formData, scored_marks: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                                            placeholder="Your score"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">Date</label>
                                    <input
                                        type="date"
                                        value={formData.attempt_date}
                                        onChange={(e) => setFormData({ ...formData, attempt_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <motion.button
                                        type="submit"
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 py-2.5 rounded-lg font-medium text-white text-sm flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {editingTest ? 'Update' : 'Save'}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        onClick={() => { setShowAddForm(false); setEditingTest(null); }}
                                        className="flex-1 bg-white/5 border border-white/10 py-2.5 rounded-lg font-medium text-gray-400 text-sm"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Test Series Modal */}
                {showTestSeries && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowTestSeries(false); setSelectedProvider(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md rounded-2xl overflow-hidden"
                            style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <span className="text-lg font-semibold text-white">Test Series</span>
                                        <p className="text-xs text-gray-500">Choose your coaching material</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowTestSeries(false); setSelectedProvider(null); }}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {!selectedProvider ? (
                                    <div className="space-y-3">
                                        {/* KSG Option */}
                                        <motion.button
                                            onClick={() => setSelectedProvider('ksg')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
                                            whileHover={{ scale: 1.01, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-purple-400">K</span>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-white font-semibold">KSG (Khan Study Group)</div>
                                                    <div className="text-gray-500 text-sm">Select year for test series</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </motion.button>

                                        {/* Vision IAS Option */}
                                        <motion.a
                                            href="https://drive.google.com/drive/folders/1j_5g8Z89UuiTNQaIRg1WBwxTzYtM_34d?dmr=1&ec=wgc-drive-hero-goto"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all block"
                                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
                                            whileHover={{ scale: 1.01, borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-red-400">V</span>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-white font-semibold">Vision IAS</div>
                                                    <div className="text-gray-500 text-sm">Access test series material</div>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-gray-500" />
                                        </motion.a>
                                    </div>
                                ) : (
                                    /* KSG Year Selection */
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setSelectedProvider(null)}
                                            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to providers
                                        </button>

                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl font-bold text-purple-400">K</span>
                                            </div>
                                            <h3 className="text-white font-semibold">KSG Test Series</h3>
                                            <p className="text-gray-500 text-sm">Select year</p>
                                        </div>

                                        {/* 2025 */}
                                        <motion.a
                                            href="https://drive.google.com/drive/folders/15dHcKsqakmalZGSS6A2A81kTKgXaYXUN?dmr=1&ec=wgc-drive-hero-goto"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all block"
                                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
                                            whileHover={{ scale: 1.01, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-white font-semibold">2025</div>
                                                    <div className="text-gray-500 text-xs">Current year test series</div>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-gray-500" />
                                        </motion.a>

                                        {/* 2026 */}
                                        <motion.a
                                            href="https://drive.google.com/drive/folders/1RYtGRxvGeCSIZ3vPQpFg9LqBd8jX35Yu?dmr=1&ec=wgc-drive-hero-goto"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between p-4 rounded-xl transition-all block"
                                            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}
                                            whileHover={{ scale: 1.01, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-white font-semibold">2026</div>
                                                    <div className="text-gray-500 text-xs">Upcoming test series</div>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-gray-500" />
                                        </motion.a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
