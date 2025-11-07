'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, MessageSquare, TrendingUp, Calendar, 
  Send, Upload, Brain, Target, Clock, CheckCircle 
} from 'lucide-react';
import GlassCard from './GlassCard';

export default function SmartFeatures() {
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);

  // Notes state
  const [notesData, setNotesData] = useState({ subject: '', topic: '', notes: '' });
  
  // Answer evaluation state
  const [answerData, setAnswerData] = useState<{
    question: string;
    answer: string;
    result: { score: number; feedback: string } | null;
  }>({ question: '', answer: '', result: null });
  
  // Chat state
  const [chatData, setChatData] = useState<{
    query: string;
    response: string;
    history: Array<{ query: string; response: string }>;
  }>({ query: '', response: '', history: [] });
  
  // Performance prediction state
  const [prediction, setPrediction] = useState<{
    predicted_score: number;
    confidence_level: number;
    key_factors: string[];
    recommendations: string[];
  } | null>(null);
  
  // Revision schedule state
  const [schedule, setSchedule] = useState<Array<{
    subject: string;
    date: string;
    priority: string;
    completion: string;
    focus_areas: string;
  }>>([]);

  const generateNotes = async () => {
    if (!notesData.subject || !notesData.topic) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_notes',
          data: { subject: notesData.subject, topic: notesData.topic }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setNotesData(prev => ({ ...prev, notes: result.notes }));
      }
    } catch (error) {
      console.error('Notes generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!answerData.question || !answerData.answer) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_answer',
          data: { question: answerData.question, answer: answerData.answer }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setAnswerData(prev => ({ ...prev, result }));
      }
    } catch (error) {
      console.error('Answer evaluation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatQuery = async () => {
    if (!chatData.query) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_query',
          data: { query: chatData.query }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setChatData(prev => ({ 
          ...prev, 
          response: result.response,
          history: [...prev.history, { query: prev.query, response: result.response }],
          query: ''
        }));
      }
    } catch (error) {
      console.error('Chat query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'predict_performance', data: {} })
      });
      
      const result = await response.json();
      if (result.success) {
        setPrediction(result.prediction);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/smart-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_revision_schedule', data: {} })
      });
      
      const result = await response.json();
      if (result.success) {
        setSchedule(result.schedule);
      }
    } catch (error) {
      console.error('Schedule fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'notes', label: 'Smart Notes', icon: FileText },
    { id: 'evaluate', label: 'Answer Check', icon: CheckCircle },
    { id: 'chat', label: 'AI Mentor', icon: MessageSquare },
    { id: 'predict', label: 'Performance', icon: TrendingUp },
    { id: 'schedule', label: 'Revision', icon: Calendar }
  ];

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
          <h3 className="text-2xl font-bold gradient-text-primary">Smart AI Features</h3>
          <p className="text-sm text-neutral-400">Advanced AI tools for UPSC preparation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
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
        {/* Smart Notes */}
        {activeTab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject (e.g., Polity)"
                  value={notesData.subject}
                  onChange={(e) => setNotesData(prev => ({ ...prev, subject: e.target.value }))}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Topic (e.g., Fundamental Rights)"
                  value={notesData.topic}
                  onChange={(e) => setNotesData(prev => ({ ...prev, topic: e.target.value }))}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none"
                />
              </div>
              <button
                onClick={generateNotes}
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
              >
                {loading ? 'Generating...' : 'Generate Smart Notes'}
              </button>
              {notesData.notes && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-neutral-300">{notesData.notes}</pre>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Answer Evaluation */}
        {activeTab === 'evaluate' && (
          <motion.div key="evaluate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="space-y-4">
              <textarea
                placeholder="Enter the question..."
                value={answerData.question}
                onChange={(e) => setAnswerData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none resize-none"
                rows={3}
              />
              <textarea
                placeholder="Enter your answer..."
                value={answerData.answer}
                onChange={(e) => setAnswerData(prev => ({ ...prev, answer: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none resize-none"
                rows={5}
              />
              <button
                onClick={evaluateAnswer}
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/30 rounded-lg text-green-400 hover:text-green-300 transition-colors"
              >
                {loading ? 'Evaluating...' : 'Evaluate Answer'}
              </button>
              {answerData.result && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-green-400">Score: {answerData.result.score}/10</span>
                  </div>
                  <p className="text-sm text-neutral-300">{answerData.result.feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Chat */}
        {activeTab === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="space-y-4">
              {chatData.response && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm text-neutral-300">{chatData.response}</p>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask your UPSC mentor anything..."
                  value={chatData.query}
                  onChange={(e) => setChatData(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatQuery()}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none"
                />
                <button
                  onClick={sendChatQuery}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border border-blue-400/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Prediction */}
        {activeTab === 'predict' && (
          <motion.div key="predict" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="space-y-4">
              <button
                onClick={getPrediction}
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-400/30 rounded-lg text-orange-400 hover:text-orange-300 transition-colors"
              >
                {loading ? 'Analyzing...' : 'Predict My Performance'}
              </button>
              {prediction && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{prediction.predicted_score.toFixed(0)}</div>
                      <div className="text-xs text-neutral-400">Predicted Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{prediction.confidence_level.toFixed(0)}%</div>
                      <div className="text-xs text-neutral-400">Confidence</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-neutral-300">Key Factors:</h4>
                    {prediction.key_factors.map((factor, index) => (
                      <div key={index} className="text-sm text-neutral-400">• {factor}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Revision Schedule */}
        {activeTab === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="space-y-4">
              <button
                onClick={getSchedule}
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {loading ? 'Creating...' : 'Generate Revision Schedule'}
              </button>
              {schedule.length > 0 && (
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{item.subject}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-400">
                        <div>Date: {item.date}</div>
                        <div>Progress: {item.completion}%</div>
                        <div>Focus: {item.focus_areas}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}