'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

import PerformancePrediction from '@/components/PerformancePrediction';
import SmartQuestionGenerator from '@/components/SmartQuestionGenerator';
import SmartWidget from '@/components/SmartWidget';
import ComprehensiveAnalytics from '@/components/ComprehensiveAnalytics';
import SmartFeatures from '@/components/SmartFeatures';

interface RealTimeData {
    subjects: any[];
    goals: any[];
    tests: any[];
    mood: any[];
    analytics: any;
    loading: boolean;
}

export default function AIPage() {
    const [realTimeData, setRealTimeData] = useState<RealTimeData>({
        subjects: [],
        goals: [],
        tests: [],
        mood: [],
        analytics: null,
        loading: true
    });

    useEffect(() => {
        fetchRealTimeData();
    }, []);

    const fetchRealTimeData = async () => {
        try {
            // Fetch all real-time data from various endpoints
            const [subjectsRes, goalsRes, testsRes, moodRes, analyticsRes] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/goals'),
                fetch('/api/tests'),
                fetch('/api/mood'),
                fetch('/api/goals/analytics')
            ]);

            const [subjects, goals, tests, mood, analytics] = await Promise.all([
                subjectsRes.json(),
                goalsRes.json(),
                testsRes.json(),
                moodRes.json(),
                analyticsRes.json()
            ]);

            setRealTimeData({
                subjects: Array.isArray(subjects) ? subjects : [],
                goals: Array.isArray(goals) ? goals : [],
                tests: Array.isArray(tests) ? tests : [],
                mood: Array.isArray(mood) ? mood : [],
                analytics,
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch real-time data:', error);
            setRealTimeData(prev => ({ ...prev, loading: false }));
        }
    };

    if (realTimeData.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
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
                                    className="p-3 cursor-pointer bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-400/20 hover:border-purple-400/30"
                                    size="sm"
                                >
                                    <ArrowLeft className="w-5 h-5 text-purple-400" />
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
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20">
                                    <Brain className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h1 className="text-5xl md:text-6xl font-black gradient-text-primary tracking-tight">
                                        AI Assistant
                                    </h1>
                                    <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                                        Intelligent Study Companion • Performance Analysis • Smart Recommendations
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex items-center gap-2 text-sm text-neutral-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                <span>Real-time analysis • {realTimeData.subjects.length} subjects tracked • {realTimeData.goals.length} study sessions</span>
                            </motion.div>
                        </div>
                    </div>

                    <motion.button
                        onClick={fetchRealTimeData}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 hover:border-purple-400/50 rounded-xl transition-all duration-300 group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <span className="font-medium text-white">Refresh Analysis</span>
                    </motion.button>
                </div>

                {/* Real-time Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GlassCard className="text-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20">
                        <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-blue-400">
                            {Math.round(realTimeData.subjects.reduce((sum: number, s: any) =>
                                sum + ((s.completed_lectures / Math.max(s.total_lectures, 1)) * 100), 0
                            ) / Math.max(realTimeData.subjects.length, 1))}%
                        </div>
                        <div className="text-xs text-gray-300">Avg Completion</div>
                    </GlassCard>

                    <GlassCard className="text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
                        <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-green-400">
                            {realTimeData.goals.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0).toFixed(1)}h
                        </div>
                        <div className="text-xs text-gray-300">Total Hours</div>
                    </GlassCard>

                    <GlassCard className="text-center bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20">
                        <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-purple-400">
                            {realTimeData.tests.length}
                        </div>
                        <div className="text-xs text-gray-300">Tests Taken</div>
                    </GlassCard>

                    <GlassCard className="text-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-400/20">
                        <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <div className="text-xl font-bold text-yellow-400">
                            {realTimeData.goals.reduce((sum: number, g: any) => sum + (g.topics_covered || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-300">Topics Covered</div>
                    </GlassCard>
                </div>
            </motion.div>

            {/* Smart Insights Widgets */}
            <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <SmartWidget />
            </motion.div>

            {/* AI Components Grid */}
            <div className="space-y-12">
                {/* Performance Prediction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <PerformancePrediction />
                </motion.div>

                {/* Smart Question Generator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                >
                    <SmartQuestionGenerator />
                </motion.div>

                {/* Comprehensive Analytics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                >
                    <ComprehensiveAnalytics />
                </motion.div>

                {/* Smart Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                >
                    <SmartFeatures />
                </motion.div>
            </div>
            {/* Data Insights Summary */}
            <motion.div
                className="mt-12 pt-8 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
            >
                <GlassCard className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-400/20">
                    <h3 className="text-xl font-bold text-indigo-400 mb-4">Real-time Data Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-neutral-300 mb-2">Subject Progress</h4>
                            <ul className="space-y-1 text-neutral-400">
                                {realTimeData.subjects.slice(0, 5).map((subject: any, index: number) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{subject.subject}</span>
                                        <span className="text-indigo-400">
                                            {Math.round((subject.completed_lectures / Math.max(subject.total_lectures, 1)) * 100)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-neutral-300 mb-2">Recent Study Sessions</h4>
                            <ul className="space-y-1 text-neutral-400">
                                {realTimeData.goals.slice(0, 5).map((goal: any, index: number) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{goal.subject}</span>
                                        <span className="text-green-400">{goal.hours_studied}h</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-neutral-300 mb-2">Test Performance</h4>
                            <ul className="space-y-1 text-neutral-400">
                                {realTimeData.tests.slice(0, 5).map((test: any, index: number) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{test.subject}</span>
                                        <span className="text-purple-400">
                                            {Math.round((test.scored_marks / Math.max(test.total_marks, 1)) * 100)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}