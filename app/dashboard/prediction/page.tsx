'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, Target, AlertTriangle, CheckCircle, 
  Clock, Zap, BarChart3, ArrowLeft, RefreshCw, Eye,
  Trophy, Flame, Shield, BookOpen, Timer, Users
} from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

interface PredictionData {
  examReadiness: number;
  prelimsScore: number;
  prelimsCutoff: number;
  mainsScore: number;
  interviewScore: number;
  finalScore: number;
  predictedRank: number;
  categoryRank: number;
  qualificationProbability: number;
  subjectWiseAnalysis: any;
  strengthAreas: string[];
  improvementAreas: string[];
  strategicRecommendations: string[];
  timeToExam: number;
  confidenceLevel: string;
  benchmarkComparison: any;
  detailedMetrics: any;
}

export default function PredictionPage() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchPrediction();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/prediction');
      const data = await response.json();
      setPrediction(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 1000) return 'text-green-400';
    if (rank <= 5000) return 'text-yellow-400';
    if (rank <= 20000) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'bg-green-500/20 text-green-400 border-green-400/30';
    if (prob >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
    if (prob >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
    return 'bg-red-500/20 text-red-400 border-red-400/30';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/10 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30';
      case 'low': return 'text-red-400 bg-red-500/10 border-red-400/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
    }
  };

  if (loading && !prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!prediction) return null;

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
            <Link href="/dashboard/ai">
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

            <div>
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
                    UPSC Rank Predictor
                  </h1>
                  <p className="text-lg text-neutral-300 mt-2">
                    Ultra-Rigorous Analysis • 10L+ Candidates • 1000 Selections
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span>Live Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(prediction.confidenceLevel)}`}>
                  {prediction.confidenceLevel.toUpperCase()} CONFIDENCE
                </div>
              </motion.div>
            </div>
          </div>

          <motion.button
            onClick={fetchPrediction}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 hover:border-purple-400/50 rounded-xl transition-all duration-300 group disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-5 h-5 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium text-white">
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Critical Metrics Dashboard */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Predicted Rank */}
          <GlassCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-purple-400" />
              <span className="text-sm text-neutral-400 font-medium">PREDICTED RANK</span>
            </div>
            <div className={`text-3xl font-black mb-2 ${getRankColor(prediction.predictedRank)}`}>
              {prediction.predictedRank.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              Category: {prediction.categoryRank.toLocaleString()}
            </div>
            <div className="mt-3 text-xs text-neutral-400">
              Out of 10,00,000 candidates
            </div>
          </GlassCard>

          {/* Qualification Probability */}
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-6 h-6 text-green-400" />
              <span className="text-sm text-neutral-400 font-medium">QUALIFICATION</span>
            </div>
            <div className="text-3xl font-black text-green-400 mb-2">
              {prediction.qualificationProbability}%
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getProbabilityColor(prediction.qualificationProbability)}`}>
              {prediction.qualificationProbability >= 80 ? 'EXCELLENT' :
               prediction.qualificationProbability >= 60 ? 'GOOD' :
               prediction.qualificationProbability >= 40 ? 'MODERATE' : 'CHALLENGING'}
            </div>
            <div className="mt-3 text-xs text-neutral-400">
              Based on current performance
            </div>
          </GlassCard>

          {/* Final Score */}
          <GlassCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span className="text-sm text-neutral-400 font-medium">FINAL SCORE</span>
            </div>
            <div className="text-3xl font-black text-blue-400 mb-2">
              {prediction.finalScore}
            </div>
            <div className="text-xs text-neutral-500 space-y-1">
              <div>Prelims: {prediction.prelimsScore}</div>
              <div>Mains: {prediction.mainsScore}</div>
              <div>Interview: {prediction.interviewScore}</div>
            </div>
          </GlassCard>

          {/* Exam Readiness */}
          <GlassCard className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-sm text-neutral-400 font-medium">EXAM READINESS</span>
            </div>
            <div className="text-3xl font-black text-yellow-400 mb-2">
              {prediction.examReadiness}%
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${prediction.examReadiness}%` }}
              />
            </div>
            <div className="text-xs text-neutral-400">
              {prediction.timeToExam} days remaining
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Detailed Performance Metrics */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Eye className="w-6 h-6 text-indigo-400" />
          Detailed Performance Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-green-400">Question Accuracy</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {prediction.detailedMetrics?.accuracy || 0}%
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full"
                style={{ width: `${prediction.detailedMetrics?.accuracy || 0}%` }}
              />
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              {prediction.detailedMetrics?.accuracy >= 80 ? 'Excellent' :
               prediction.detailedMetrics?.accuracy >= 70 ? 'Good' :
               prediction.detailedMetrics?.accuracy >= 60 ? 'Average' : 'Needs Improvement'}
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-blue-400">Speed Score</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {prediction.detailedMetrics?.speedScore || 0}%
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${prediction.detailedMetrics?.speedScore || 0}%` }}
              />
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Time management efficiency
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-purple-400">Consistency</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {prediction.detailedMetrics?.consistency || 0}%
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full"
                style={{ width: `${prediction.detailedMetrics?.consistency || 0}%` }}
              />
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Study routine stability
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Subject-wise Analysis */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Subject-wise Performance Matrix
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prediction.subjectWiseAnalysis && Object.entries(prediction.subjectWiseAnalysis).map(([subject, data]: [string, any]) => (
            <GlassCard key={subject} className={`bg-white/5 border-white/10 ${
              subject === 'psir' || subject === 'essay' ? 'md:col-span-2' : ''
            }`}>
              <div className={subject === 'psir' || subject === 'essay' ? 'text-left' : 'text-center'}>
                <h5 className="font-bold text-white mb-3 uppercase tracking-wide">
                  {subject.replace('gs', 'GS ').replace('csat', 'CSAT').replace('psir', 'PSIR').replace('optional', 'Optional').replace('essay', 'Essay')}
                </h5>
                
                {subject === 'csat' ? (
                  <div>
                    <div className="text-2xl font-bold text-blue-400 mb-2">{data.score}</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      data.qualifying ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {data.qualifying ? 'QUALIFYING' : 'NOT QUALIFYING'}
                    </div>
                  </div>
                ) : subject === 'psir' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-purple-400">{data.score}</div>
                        <div className="text-xs text-neutral-400">Total Score (500)</div>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getRankColor(data.rank)}`}>
                          Rank: {data.rank?.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-400">{data.percentile}th percentile</div>
                      </div>
                    </div>
                    {data.paperWise && (
                      <div className="space-y-2">
                        <div className="text-xs text-neutral-300 font-medium">Paper-wise Analysis:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 p-2 rounded">
                            <div className="font-medium text-blue-400">Paper 1: {Math.round(data.paperWise.paper1.completion)}%</div>
                            <div className="text-neutral-400">Theory & Indian Politics</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded">
                            <div className="font-medium text-indigo-400">Paper 2: {Math.round(data.paperWise.paper2.completion)}%</div>
                            <div className="text-neutral-400">Comparative & IR</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : subject === 'essay' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-yellow-400">{data.score}</div>
                        <div className="text-xs text-neutral-400">Predicted Score (250)</div>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${getRankColor(data.rank)}`}>
                          Rank: {data.rank?.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-400">{data.percentile}th percentile</div>
                      </div>
                    </div>
                    {data.writingSkill && (
                      <div className="space-y-2">
                        <div className="text-xs text-neutral-300 font-medium">Writing Analysis:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 p-2 rounded">
                            <div className="font-medium text-yellow-400">Completion: {data.completion}%</div>
                            <div className="text-neutral-400">Lectures + Practice</div>
                          </div>
                          <div className="bg-white/5 p-2 rounded">
                            <div className="font-medium text-orange-400">Writing Skill: {data.writingSkill}%</div>
                            <div className="text-neutral-400">Structure + Content</div>
                          </div>
                        </div>
                        {data.essaysPracticed !== undefined && (
                          <div className="text-xs text-neutral-400">
                            Essays Practiced: <span className="text-white font-medium">{data.essaysPracticed}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <div className="text-lg font-bold text-white">{data.score}</div>
                      <div className="text-xs text-neutral-400">Predicted Score</div>
                    </div>
                    {data.rank && (
                      <div>
                        <div className={`text-sm font-medium ${getRankColor(data.rank)}`}>
                          Rank: {data.rank.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {data.percentile && (
                      <div>
                        <div className="text-sm text-green-400">
                          {data.percentile}th percentile
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Strategic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <GlassCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
            <h4 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strength Areas
            </h4>
            <div className="space-y-3">
              {prediction.strengthAreas?.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                  <span className="text-neutral-200">{area}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Improvement Areas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <GlassCard className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-400/20">
            <h4 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Improvement Areas
            </h4>
            <div className="space-y-3">
              {prediction.improvementAreas?.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-400/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  <span className="text-neutral-200">{area}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Strategic Recommendations */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <GlassCard className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-400/20">
          <h4 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Ultra-Strategic Action Plan
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.strategicRecommendations?.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg"
              >
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                </div>
                <span className="text-neutral-200 text-sm leading-relaxed">{rec}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Benchmark Comparison */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/20">
          <h4 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            UPSC Benchmark Comparison
          </h4>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {prediction.benchmarkComparison?.toppers || 'N/A'}
              </div>
              <div className="text-sm text-neutral-400">Toppers Average</div>
              <div className="text-xs text-neutral-500 mt-1">Rank 1-100</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {prediction.benchmarkComparison?.yourPosition || 'N/A'}
              </div>
              <div className="text-sm text-neutral-400">Your Predicted Score</div>
              <div className="text-xs text-neutral-500 mt-1">Current Performance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400 mb-2">
                {prediction.benchmarkComparison?.averageCandidate || 'N/A'}
              </div>
              <div className="text-sm text-neutral-400">Average Candidate</div>
              <div className="text-xs text-neutral-500 mt-1">50th Percentile</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-neutral-300 mb-2">Score Distribution Visualization</div>
            <div className="flex items-end gap-2 h-20">
              <div className="bg-gray-400 w-8 h-12 rounded-t flex-shrink-0" title="Average Candidate" />
              <div 
                className="bg-blue-400 w-8 rounded-t flex-shrink-0" 
                style={{ height: `${Math.min((prediction.finalScore / 1200) * 80, 80)}px` }}
                title="Your Score"
              />
              <div className="bg-yellow-400 w-8 h-20 rounded-t flex-shrink-0" title="Toppers" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Reality Check Footer */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <GlassCard className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-400/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h4 className="text-lg font-bold text-red-400">UPSC Reality Check</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-2xl font-bold text-white mb-2">10,00,000+</div>
              <div className="text-neutral-400">Total Candidates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">1,000</div>
              <div className="text-neutral-400">Final Selections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400 mb-2">0.1%</div>
              <div className="text-neutral-400">Success Rate</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
            <p className="text-xs text-neutral-300 leading-relaxed">
              This prediction is based on rigorous analysis of your current performance. 
              UPSC CSE is extremely competitive. Use this as motivation to improve, not as a guarantee.
              Consistent effort and strategic preparation are key to success.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}