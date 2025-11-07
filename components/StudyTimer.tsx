'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, Coffee } from 'lucide-react';
import GlassCard from './GlassCard';

interface StudySession {
  subject: string;
  duration: number;
  type: 'focus' | 'break' | 'pomodoro';
}

export default function StudyTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [subject, setSubject] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [customDuration, setCustomDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (time === 0 && isRunning) {
        handleSessionComplete();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, time]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    setCompletedSessions(prev => prev + 1);
    
    // Save session to database
    try {
      await fetch('/api/study-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          duration: sessionType === 'focus' ? 25 : 5,
          type: sessionType
        })
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    // Auto-switch between focus and break
    if (sessionType === 'focus') {
      setSessionType('break');
      setTime(breakDuration * 60);
    } else {
      setSessionType('focus');
      setTime(customDuration * 60);
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(sessionType === 'focus' ? customDuration * 60 : breakDuration * 60);
  };

  const applySettings = () => {
    setTime(sessionType === 'focus' ? customDuration * 60 : breakDuration * 60);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'focus' ? customDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - time) / totalTime) * 100;

  return (
    <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20">
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Clock className="w-8 h-8 text-blue-400" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold gradient-text-primary">Study Timer</h3>
          <p className="text-sm text-neutral-400">Pomodoro technique for focused study</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={sessionType === 'focus' ? '#3B82F6' : '#10B981'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white mb-2">
              {formatTime(time)}
            </div>
            <div className={`text-sm font-medium ${
              sessionType === 'focus' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {sessionType === 'focus' ? (
                <><Clock className="w-4 h-4 inline mr-1" />Focus</>
              ) : (
                <><Coffee className="w-4 h-4 inline mr-1" />Break</>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg transition-colors"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg transition-colors"
          >
            <Square className="w-5 h-5" />
            Reset
          </button>
        </div>

        {sessionType === 'focus' && (
          <input
            type="text"
            placeholder="What are you studying?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-blue-400/50 focus:outline-none"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{completedSessions}</div>
          <div className="text-xs text-neutral-400">Sessions Today</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{Math.floor(completedSessions * customDuration / 60)}h</div>
          <div className="text-xs text-neutral-400">Study Time</div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-400/50 focus:outline-none"
                />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-400 mb-2">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setCustomDuration(25); setBreakDuration(5); }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    Classic (25/5)
                  </button>
                  <button
                    onClick={() => { setCustomDuration(50); setBreakDuration(10); }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    Extended (50/10)
                  </button>
                  <button
                    onClick={() => { setCustomDuration(90); setBreakDuration(20); }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    Deep Focus (90/20)
                  </button>
                  <button
                    onClick={() => { setCustomDuration(120); setBreakDuration(30); }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                  >
                    Long Study (120/30)
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applySettings}
                className="px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </GlassCard>
  );
}