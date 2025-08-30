'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, CheckCircle, XCircle, Clock, Brain } from 'lucide-react';
import GlassCard from './GlassCard';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export default function SmartQuestionGenerator() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('current-affairs');

  const topics = [
    { id: 'current-affairs', name: 'Current Affairs' },
    { id: 'polity', name: 'Polity & Governance' },
    { id: 'geography', name: 'Geography' },
    { id: 'history', name: 'History' },
    { id: 'economics', name: 'Economics' },
    { id: 'environment', name: 'Environment' }
  ];

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic, 
          count: 5,
          difficulty: 'mixed'
        })
      });
      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Fallback questions
      setQuestions([
        {
          id: '1',
          question: 'Which of the following is the constitutional body responsible for conducting elections in India?',
          options: [
            'Election Commission of India',
            'Central Election Committee',
            'National Election Board',
            'Supreme Court of India'
          ],
          correctAnswer: 0,
          explanation: 'The Election Commission of India is a constitutional body established under Article 324 of the Indian Constitution.',
          difficulty: 'easy',
          topic: 'Polity'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'hard': return 'text-red-400 bg-red-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  return (
    <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/20">
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Zap className="w-8 h-8 text-indigo-400" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold gradient-text-primary">Smart Question Generator</h3>
          <p className="text-sm text-neutral-400">AI-generated practice questions</p>
        </div>
      </div>

      {/* Topic Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-300 mb-3">Select Topic</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                selectedTopic === topic.id
                  ? 'bg-indigo-500/30 text-indigo-400 border border-indigo-400/30'
                  : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {questions.length === 0 && (
        <div className="text-center py-8">
          <motion.button
            onClick={generateQuestions}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Questions...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Generate Questions
              </div>
            )}
          </motion.button>
        </div>
      )}

      {/* Question Display */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(questions[currentQuestion].difficulty)}`}>
                {questions[currentQuestion].difficulty.toUpperCase()}
              </div>
              <div className="text-sm text-neutral-400">
                Score: {score}/{questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Question */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-medium text-white mb-4 leading-relaxed">
              {questions[currentQuestion].question}
            </h4>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => {
                let buttonClass = 'p-4 rounded-lg border text-left transition-all hover:bg-white/10';
                
                if (showResult) {
                  if (index === questions[currentQuestion].correctAnswer) {
                    buttonClass += ' bg-green-500/20 border-green-400/30 text-green-400';
                  } else if (index === selectedAnswer && index !== questions[currentQuestion].correctAnswer) {
                    buttonClass += ' bg-red-500/20 border-red-400/30 text-red-400';
                  } else {
                    buttonClass += ' bg-white/5 border-white/10 text-neutral-300';
                  }
                } else {
                  buttonClass += ' bg-white/5 border-white/10 text-white hover:border-indigo-400/30';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showResult && index === questions[currentQuestion].correctAnswer && (
                        <CheckCircle className="w-5 h-5 ml-auto" />
                      )}
                      {showResult && index === selectedAnswer && index !== questions[currentQuestion].correctAnswer && (
                        <XCircle className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg"
              >
                <h5 className="font-semibold text-blue-400 mb-2">Explanation</h5>
                <p className="text-sm text-neutral-300">{questions[currentQuestion].explanation}</p>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={generateQuestions}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              New Set
            </button>
            
            {showResult && currentQuestion < questions.length - 1 && (
              <motion.button
                onClick={nextQuestion}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next Question
              </motion.button>
            )}
            
            {showResult && currentQuestion === questions.length - 1 && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-400 mb-2">
                  Quiz Complete! Score: {score}/{questions.length}
                </div>
                <button
                  onClick={generateQuestions}
                  className="px-6 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}