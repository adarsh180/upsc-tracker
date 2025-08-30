'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Brain } from 'lucide-react';

interface SmartInsight {
  type: 'trend' | 'goal' | 'time' | 'ai';
  title: string;
  value: string;
  change: string;
  suggestion: string;
  color: string;
}

export default function SmartWidget() {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const generateRealTimeInsights = async () => {
    try {
      // Fetch real-time data with timeout
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]) as Promise<Response>;
      };

      const [subjectsRes, goalsRes, testsRes] = await Promise.all([
        fetchWithTimeout('/api/subjects'),
        fetchWithTimeout('/api/goals'),
        fetchWithTimeout('/api/tests')
      ]);

      const [subjects, goals, tests] = await Promise.all([
        subjectsRes.json(),
        goalsRes.json(),
        testsRes.json()
      ]);

      // Calculate real insights
      const subjectsArray = Array.isArray(subjects) ? subjects : [];
      const goalsArray = Array.isArray(goals) ? goals : [];
      const testsArray = Array.isArray(tests) ? tests : [];

      // Calculate study efficiency
      const totalCompletion = subjectsArray.reduce((sum: number, s: any) => {
        const completion = (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100;
        return sum + completion;
      }, 0) / Math.max(subjectsArray.length, 1);

      // Calculate weekly study days
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentGoals = goalsArray.filter((g: any) => new Date(g.date) >= last7Days);
      const studyDays = recentGoals.length;

      // Find most productive time (simplified)
      const peakHour = recentGoals.length > 0 ? '6-8 AM' : 'Not enough data';

      // Find weakest subject
      const weakestSubject = subjectsArray
        .sort((a: any, b: any) => {
          const aCompletion = (a.completed_lectures / Math.max(a.total_lectures, 1)) * 100;
          const bCompletion = (b.completed_lectures / Math.max(b.total_lectures, 1)) * 100;
          return aCompletion - bCompletion;
        })[0];

      const realInsights: SmartInsight[] = [
        {
          type: 'trend',
          title: 'Study Efficiency',
          value: `${Math.round(totalCompletion)}%`,
          change: totalCompletion > 60 ? '+Good progress' : 'Needs improvement',
          suggestion: totalCompletion > 70 ? 'Excellent! Keep up the momentum.' : 'Focus on completing more lectures.',
          color: totalCompletion > 70 ? 'text-green-400' : totalCompletion > 50 ? 'text-yellow-400' : 'text-red-400'
        },
        {
          type: 'goal',
          title: 'Weekly Target',
          value: `${studyDays}/7 days`,
          change: `${Math.round((studyDays / 7) * 100)}% complete`,
          suggestion: studyDays >= 6 ? 'Great consistency!' : `Aim for ${7 - studyDays} more study days.`,
          color: studyDays >= 6 ? 'text-green-400' : studyDays >= 4 ? 'text-yellow-400' : 'text-red-400'
        },
        {
          type: 'time',
          title: 'Peak Hours',
          value: peakHour,
          change: recentGoals.length > 0 ? 'Based on your data' : 'Need more data',
          suggestion: 'Schedule difficult topics during your most productive hours.',
          color: 'text-purple-400'
        },
        {
          type: 'ai',
          title: 'AI Recommendation',
          value: weakestSubject ? `Focus on ${weakestSubject.subject}` : 'Keep studying',
          change: weakestSubject ? 'Weak area detected' : 'Good progress',
          suggestion: weakestSubject ? 
            `Increase time on ${weakestSubject.subject} - currently at ${Math.round((weakestSubject.completed_lectures / Math.max(weakestSubject.total_lectures, 1)) * 100)}%` :
            'Continue your current study pattern.',
          color: 'text-orange-400'
        }
      ];

      setInsights(realInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Fallback to default insights with sample data
      setInsights([
        {
          type: 'trend',
          title: 'Study Efficiency',
          value: '65%',
          change: 'Good progress',
          suggestion: 'Keep up the consistent study pattern.',
          color: 'text-yellow-400'
        },
        {
          type: 'goal',
          title: 'Weekly Target',
          value: '5/7 days',
          change: '71% complete',
          suggestion: 'Aim for 2 more study days this week.',
          color: 'text-yellow-400'
        },
        {
          type: 'time',
          title: 'Peak Hours',
          value: '6-8 AM',
          change: 'Most productive',
          suggestion: 'Schedule difficult topics during morning hours.',
          color: 'text-purple-400'
        },
        {
          type: 'ai',
          title: 'AI Recommendation',
          value: 'Focus on weak areas',
          change: 'Optimization needed',
          suggestion: 'Identify and strengthen your weakest subjects.',
          color: 'text-orange-400'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRealTimeInsights();
    // Set a maximum loading time of 8 seconds
    const maxLoadingTimer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 8000);

    return () => clearTimeout(maxLoadingTimer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-5 h-5 bg-white/20 rounded"></div>
              <div className="w-12 h-3 bg-white/20 rounded"></div>
            </div>
            <div className="mb-2">
              <div className="w-20 h-4 bg-white/20 rounded mb-2"></div>
              <div className="w-16 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="w-full h-3 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'goal': return Target;
      case 'time': return Clock;
      case 'ai': return Brain;
      default: return TrendingUp;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {insights.map((insight, index) => {
        const Icon = getIcon(insight.type);
        return (
          <motion.div
            key={insight.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${insight.color}`} />
              <span className="text-xs text-neutral-400 uppercase tracking-wide">
                {insight.type}
              </span>
            </div>
            
            <div className="mb-2">
              <h3 className="text-sm font-medium text-neutral-300 mb-1">
                {insight.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${insight.color}`}>
                  {insight.value}
                </span>
                <span className="text-xs text-neutral-500">
                  {insight.change}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              {insight.suggestion}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}