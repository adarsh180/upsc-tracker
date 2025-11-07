'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

interface EvaluationResult {
  overall_score: number;
  content_score: number;
  structure_score: number;
  language_score: number;
  coherence_score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export default function EssayEvaluator() {
  const [essay, setEssay] = useState('');
  const [topic, setTopic] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleEssayChange = (text: string) => {
    setEssay(text);
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const evaluateEssay = async () => {
    if (!essay.trim() || !topic.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/essay/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay, topic })
      });
      
      const data = await response.json();
      if (data.success) {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error('Failed to evaluate essay:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-400/20">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <FileText className="w-8 h-8 text-blue-400" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold gradient-text-primary">Essay Evaluator</h3>
            <p className="text-sm text-neutral-400">AI-powered UPSC Mains essay assessment</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Essay Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the essay topic or question..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-blue-400/50 focus:outline-none"
            />
          </div>

          {/* Essay Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-neutral-300">
                Your Essay
              </label>
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span>Words: {wordCount}</span>
                <span className={wordCount >= 1000 && wordCount <= 1200 ? 'text-green-400' : 'text-yellow-400'}>
                  Target: 1000-1200 words
                </span>
              </div>
            </div>
            <textarea
              value={essay}
              onChange={(e) => handleEssayChange(e.target.value)}
              placeholder="Write your essay here... Aim for 1000-1200 words for UPSC Mains standard."
              className="w-full h-96 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-blue-400/50 focus:outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={evaluateEssay}
            disabled={!essay.trim() || !topic.trim() || loading || wordCount < 200}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            {loading ? 'Evaluating Essay...' : 'Evaluate Essay'}
          </button>
        </div>
      </GlassCard>

      {/* Evaluation Results */}
      {evaluation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GlassCard className={`text-center ${getScoreBg(evaluation.overall_score)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                {evaluation.overall_score}%
              </div>
              <div className="text-xs text-neutral-400">Overall</div>
            </GlassCard>
            
            <GlassCard className={`text-center ${getScoreBg(evaluation.content_score)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.content_score)}`}>
                {evaluation.content_score}%
              </div>
              <div className="text-xs text-neutral-400">Content</div>
            </GlassCard>
            
            <GlassCard className={`text-center ${getScoreBg(evaluation.structure_score)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.structure_score)}`}>
                {evaluation.structure_score}%
              </div>
              <div className="text-xs text-neutral-400">Structure</div>
            </GlassCard>
            
            <GlassCard className={`text-center ${getScoreBg(evaluation.language_score)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.language_score)}`}>
                {evaluation.language_score}%
              </div>
              <div className="text-xs text-neutral-400">Language</div>
            </GlassCard>
            
            <GlassCard className={`text-center ${getScoreBg(evaluation.coherence_score)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.coherence_score)}`}>
                {evaluation.coherence_score}%
              </div>
              <div className="text-xs text-neutral-400">Coherence</div>
            </GlassCard>
          </div>

          {/* Detailed Feedback */}
          <GlassCard className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-400/20">
            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Detailed Feedback
            </h4>
            <p className="text-neutral-300 leading-relaxed">{evaluation.feedback}</p>
          </GlassCard>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-4">Strengths</h4>
              <ul className="space-y-2">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-neutral-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </GlassCard>
            
            <GlassCard className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-400/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">Areas for Improvement</h4>
              <ul className="space-y-2">
                {evaluation.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-neutral-300 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Suggestions */}
          <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20">
            <h4 className="text-lg font-semibold text-purple-400 mb-4">Improvement Suggestions</h4>
            <ul className="space-y-2">
              {evaluation.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-neutral-300 text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}