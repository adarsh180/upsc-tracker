'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import GlassCard from './GlassCard';

interface Question {
  id: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number;
  exam_type: 'prelims' | 'mains';
}

interface QuestionAttempt {
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
  time_taken: number;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    exam_type: '',
    year: ''
  });
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
    fetchAttempts();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data.data || []);
      if (data.data && data.data.length > 0) {
        setCurrentQuestion(data.data[0]);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const response = await fetch('/api/questions/attempts');
      const data = await response.json();
      setAttempts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return;

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    try {
      await fetch('/api/questions/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken: timeTaken
        })
      });

      setShowResult(true);
      fetchAttempts();
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const nextQuestion = () => {
    const currentIndex = questions.findIndex(q => q.id === currentQuestion?.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentQuestion(questions[nextIndex]);
    setSelectedAnswer('');
    setShowResult(false);
    setStartTime(Date.now());
  };

  const getStats = () => {
    const total = attempts.length;
    const correct = attempts.filter(a => a.is_correct).length;
    const avgTime = attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.time_taken, 0) / attempts.length)
      : 0;
    
    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      avgTime
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-96 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20">
          <HelpCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-xs text-neutral-400">Questions Attempted</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
          <div className="text-xs text-neutral-400">Accuracy</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20">
          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">{stats.avgTime}s</div>
          <div className="text-xs text-neutral-400">Avg Time</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-400/20">
          <XCircle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-400">{stats.total - stats.correct}</div>
          <div className="text-xs text-neutral-400">Incorrect</div>
        </GlassCard>
      </div>

      {/* Question Display */}
      <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <HelpCircle className="w-8 h-8 text-indigo-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold gradient-text-primary">Question Bank</h3>
              <p className="text-sm text-neutral-400">Practice with previous year questions</p>
            </div>
          </div>
        </div>

        {currentQuestion ? (
          <div className="space-y-6">
            {/* Question Info */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                {currentQuestion.subject}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                {currentQuestion.exam_type.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                {currentQuestion.year}
              </span>
            </div>

            {/* Question */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Question</h4>
              <p className="text-neutral-200 leading-relaxed mb-4">
                {currentQuestion.question}
              </p>
              
              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = selectedAnswer === optionLetter;
                  const isCorrect = currentQuestion.correct_answer === optionLetter;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !showResult && setSelectedAnswer(optionLetter)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResult
                          ? isCorrect
                            ? 'border-green-400 bg-green-500/20 text-green-400'
                            : isSelected
                            ? 'border-red-400 bg-red-500/20 text-red-400'
                            : 'border-white/10 bg-white/5 text-neutral-300'
                          : isSelected
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-400'
                          : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <span className="font-medium mr-3">{optionLetter}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className={`flex items-center gap-3 mb-4 ${
                  selectedAnswer === currentQuestion.correct_answer ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedAnswer === currentQuestion.correct_answer ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <h4 className="text-lg font-semibold">
                    {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect'}
                  </h4>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-neutral-400 mb-2">Correct Answer: {currentQuestion.correct_answer}</p>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                  <h5 className="text-blue-400 font-medium mb-2">Explanation</h5>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {!showResult ? (
                <button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg text-indigo-400 transition-colors disabled:opacity-50"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 transition-colors"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No questions available</p>
            <p className="text-sm">Questions will be added soon!</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}