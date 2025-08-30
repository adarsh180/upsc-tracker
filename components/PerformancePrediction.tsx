'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, CheckCircle, Clock, Brain } from 'lucide-react';
import GlassCard from './GlassCard';

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
  subjectWiseAnalysis: {
    gs1: { score: number; rank: number; percentile: number };
    gs2: { score: number; rank: number; percentile: number };
    gs3: { score: number; rank: number; percentile: number };
    gs4: { score: number; rank: number; percentile: number };
    csat: { score: number; qualifying: boolean };
    optional: { score: number; rank: number; percentile: number };
    essay: { score: number; rank: number; percentile: number };
  };
  strengthAreas: string[];
  improvementAreas: string[];
  strategicRecommendations: string[];
  timeToExam: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  benchmarkComparison: {
    toppers: number;
    averageCandidate: number;
    yourPosition: number;
  };
}

export default function PerformancePrediction() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      const response = await fetch('/api/ai/prediction');
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
      // Fallback data with UPSC-specific metrics
      setPrediction({
        examReadiness: 72,
        prelimsScore: 118,
        prelimsCutoff: 98,
        mainsScore: 850,
        interviewScore: 180,
        finalScore: 1030,
        predictedRank: 450,
        categoryRank: 120,
        qualificationProbability: 78,
        subjectWiseAnalysis: {
          gs1: { score: 95, rank: 2500, percentile: 85 },
          gs2: { score: 88, rank: 3200, percentile: 78 },
          gs3: { score: 102, rank: 1800, percentile: 92 },
          gs4: { score: 85, rank: 3800, percentile: 72 },
          csat: { score: 68, qualifying: true },
          optional: { score: 145, rank: 1200, percentile: 88 },
          essay: { score: 125, rank: 2100, percentile: 82 }
        },
        strengthAreas: [
          'General Studies 3 (Science & Technology)',
          'Optional Subject Performance',
          'Essay Writing Structure'
        ],
        improvementAreas: [
          'General Studies 4 (Ethics)',
          'Current Affairs Integration',
          'Answer Writing Speed'
        ],
        strategicRecommendations: [
          'Focus 40% time on GS4 - Ethics case studies and value-based questions',
          'Daily current affairs integration with static topics for better retention',
          'Practice 8-10 answer writing daily with time constraints',
          'Strengthen weak areas in Polity and Governance for GS2'
        ],
        timeToExam: 180,
        confidenceLevel: 'medium',
        benchmarkComparison: {
          toppers: 1200,
          averageCandidate: 750,
          yourPosition: 1030
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/10 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30';
      case 'low': return 'text-red-400 bg-red-500/10 border-red-400/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
    }
  };

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-96 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  if (!prediction) return null;

  return (
    <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20">
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Brain className="w-8 h-8 text-blue-400" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold gradient-text-primary">UPSC Performance Prediction</h3>
          <p className="text-sm text-neutral-400">Comprehensive rank prediction & strategic analysis</p>
        </div>
        <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(prediction.confidenceLevel)}`}>
          {prediction.confidenceLevel.toUpperCase()} CONFIDENCE
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-xs text-neutral-400">PRELIMS</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{prediction.prelimsScore}</div>
          <div className="text-xs text-neutral-500">Score (Cutoff: {prediction.prelimsCutoff})</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-neutral-400">MAINS</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{prediction.mainsScore}</div>
          <div className="text-xs text-neutral-500">Written Score</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-neutral-400">INTERVIEW</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{prediction.interviewScore}</div>
          <div className="text-xs text-neutral-500">Personality Test</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-neutral-400">FINAL RANK</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{prediction.predictedRank}</div>
          <div className="text-xs text-neutral-500">All India Rank</div>
        </div>
      </div>

      {/* Qualification Probability */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-indigo-400">Qualification Probability</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              prediction.qualificationProbability >= 80 ? 'bg-green-500/20 text-green-400' :
              prediction.qualificationProbability >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {prediction.qualificationProbability}%
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-neutral-400">Final Score:</span>
              <div className="text-xl font-bold text-white">{prediction.finalScore}</div>
            </div>
            <div>
              <span className="text-neutral-400">Category Rank:</span>
              <div className="text-xl font-bold text-indigo-400">{prediction.categoryRank}</div>
            </div>
            <div>
              <span className="text-neutral-400">Days Remaining:</span>
              <div className="text-xl font-bold text-purple-400">{prediction.timeToExam}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Analysis */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-4">Subject-wise Performance Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prediction.subjectWiseAnalysis && Object.entries(prediction.subjectWiseAnalysis).map(([subject, data]) => (
            <div key={subject} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h5 className="font-medium text-white mb-2 uppercase">{subject.replace('gs', 'GS ')}</h5>
              {subject === 'csat' ? (
                <div>
                  <div className="text-lg font-bold text-blue-400">{data.score}</div>
                  <div className={`text-xs ${'qualifying' in data && data.qualifying ? 'text-green-400' : 'text-red-400'}`}>
                    {'qualifying' in data && data.qualifying ? 'Qualifying' : 'Not Qualifying'}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-400">Score:</span>
                    <span className="text-sm font-medium text-white">{data.score}</span>
                  </div>
                  {'rank' in data && (
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-400">Rank:</span>
                      <span className="text-sm text-blue-400">{data.rank}</span>
                    </div>
                  )}
                  {'percentile' in data && (
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-400">Percentile:</span>
                      <span className="text-sm text-green-400">{data.percentile}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Analysis */}
      <div className="space-y-6">
        {/* Benchmark Comparison */}
        <div>
          <h4 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Benchmark Comparison
          </h4>
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-400">{prediction.benchmarkComparison?.toppers || 'N/A'}</div>
                <div className="text-xs text-neutral-400">Toppers Average</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{prediction.benchmarkComparison?.yourPosition || 'N/A'}</div>
                <div className="text-xs text-neutral-400">Your Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">{prediction.benchmarkComparison?.averageCandidate || 'N/A'}</div>
                <div className="text-xs text-neutral-400">Average Candidate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strength & Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Strength Areas
            </h4>
            <div className="space-y-2">
              {prediction.strengthAreas?.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-green-500/10 border border-green-400/20 rounded-lg text-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{area}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Improvement Areas
            </h4>
            <div className="space-y-2">
              {prediction.improvementAreas?.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-red-500/10 border border-red-400/20 rounded-lg text-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{area}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div>
          <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Strategic Recommendations
          </h4>
          <div className="space-y-3">
            {prediction.strategicRecommendations?.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg text-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                  </div>
                  <span className="text-neutral-200">{rec}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button
          onClick={fetchPrediction}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors text-sm"
        >
          Update Prediction
        </button>
      </div>
    </GlassCard>
  );
}