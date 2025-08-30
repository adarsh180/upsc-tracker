'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Lightbulb, Target, Clock, TrendingUp, BookOpen, AlertCircle, 
  Plus, CheckCircle, Calendar, BarChart3, Settings, MessageSquare,
  Edit3, Save, X, ArrowRight, Zap
} from 'lucide-react';
import GlassCard from './GlassCard';

interface StudySubject {
  name: string;
  days: number;
}

interface StudyTask {
  id: number;
  subject: string;
  task_type: string;
  task_description: string;
  target_date: string;
  estimated_hours: number;
  questions_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface ProgressAnalysis {
  overallStatus: 'on_track' | 'ahead' | 'behind';
  completionRate: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  nextWeekFocus: string[];
  motivationalMessage: string;
}

export default function AIStudyAssistant() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  
  // Setup form state
  const [subjects, setSubjects] = useState<StudySubject[]>([{ name: '', days: 30 }]);
  const [timeline, setTimeline] = useState(180);
  const [goals, setGoals] = useState(['']);
  const [questionsPerDay, setQuestionsPerDay] = useState(50);
  
  // Target update state
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [newTargetDays, setNewTargetDays] = useState(0);
  const [updateReason, setUpdateReason] = useState('');

  useEffect(() => {
    // Check if user has existing plan
    const savedPlanId = localStorage.getItem('aiStudyPlanId');
    if (savedPlanId) {
      setPlanId(parseInt(savedPlanId));
      setActiveTab('tasks');
      loadTasks(parseInt(savedPlanId));
    }
  }, []);

  const initializePlan = async () => {
    if (subjects.some(s => !s.name) || goals.some(g => !g)) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize_plan',
          data: { subjects, timeline, goals, questionsPerDay }
        })
      });

      const result = await response.json();
      if (result.success) {
        setPlanId(result.planId);
        localStorage.setItem('aiStudyPlanId', result.planId.toString());
        setActiveTab('tasks');
        loadTasks(result.planId);
      }
    } catch (error) {
      console.error('Failed to initialize plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (planId: number) => {
    try {
      const response = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_tasks',
          data: { planId, dateRange: 7 }
        })
      });

      const result = await response.json();
      if (result.success) {
        setTasks(result.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const response = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_task',
          data: { 
            taskId, 
            completionData: { 
              completionPercentage: 100, 
              performanceScore: 8.5 
            } 
          }
        })
      });

      const result = await response.json();
      if (result.success && planId) {
        loadTasks(planId);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const updateTarget = async (subject: string) => {
    if (!planId || !newTargetDays || !updateReason) return;

    try {
      const response = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_target',
          data: { planId, subject, newTargetDays, reason: updateReason }
        })
      });

      const result = await response.json();
      if (result.success) {
        setEditingTarget(null);
        setNewTargetDays(0);
        setUpdateReason('');
        loadTasks(planId);
      }
    } catch (error) {
      console.error('Failed to update target:', error);
    }
  };

  const loadAnalysis = async () => {
    if (!planId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_analysis',
          data: { planId }
        })
      });

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', days: 30 }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'practice': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'revision': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'test': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'current_affairs': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <GlassCard className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-400/20">
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Brain className="w-8 h-8 text-purple-400" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold gradient-text-primary">AI Study Assistant</h3>
          <p className="text-sm text-neutral-400">Personalized task assignment & progress tracking</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'analysis', label: 'AI Analysis', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              if (id === 'analysis' && planId) loadAnalysis();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-purple-500/30 text-purple-400 border border-purple-400/30'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-400">Analyzing your progress...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className={`p-4 rounded-xl border ${
                  analysis.overallStatus === 'on_track' ? 'bg-green-500/10 border-green-400/20' :
                  analysis.overallStatus === 'ahead' ? 'bg-blue-500/10 border-blue-400/20' :
                  'bg-red-500/10 border-red-400/20'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    analysis.overallStatus === 'on_track' ? 'text-green-400' :
                    analysis.overallStatus === 'ahead' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    You are {analysis.overallStatus.replace('_', ' ')}!
                  </h4>
                  <p className="text-sm text-neutral-300 mb-2">{analysis.motivationalMessage}</p>
                  <div className="text-lg font-bold">
                    {analysis.completionRate.toFixed(1)}% Complete
                  </div>
                </div>

                {/* Strong & Weak Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Strong Areas
                    </h4>
                    <div className="space-y-2">
                      {analysis.strongAreas.map((area, index) => (
                        <div key={index} className="p-2 bg-green-500/10 border border-green-400/20 rounded-lg text-sm">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </h4>
                    <div className="space-y-2">
                      {analysis.weakAreas.map((area, index) => (
                        <div key={index} className="p-2 bg-red-500/10 border border-red-400/20 rounded-lg text-sm">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-purple-500/10 border border-purple-400/20 rounded-lg text-sm flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Week Focus */}
                <div>
                  <h4 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Next Week Focus
                  </h4>
                  <div className="space-y-2">
                    {analysis.nextWeekFocus.map((focus, index) => (
                      <div key={index} className="p-2 bg-indigo-500/10 border border-indigo-400/20 rounded-lg text-sm">
                        {focus}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analysis available. Complete some tasks first!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}