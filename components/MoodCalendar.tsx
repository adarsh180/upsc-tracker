'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';

type MoodEntry = {
  id: number;
  date: string;
  mood: 'happy' | 'excited' | 'motivated' | 'confident' | 'neutral' | 'tired' | 'stressed' | 'frustrated' | 'sad' | 'anxious' | 'overwhelmed' | 'bored';
  note?: string;
  created_at: string;
  updated_at: string;
};

const moodColors = {
  happy: 'bg-green-500',
  excited: 'bg-orange-500',
  motivated: 'bg-blue-500',
  confident: 'bg-purple-500',
  neutral: 'bg-yellow-500',
  tired: 'bg-gray-500',
  stressed: 'bg-red-500',
  frustrated: 'bg-red-600',
  sad: 'bg-blue-600',
  anxious: 'bg-yellow-600',
  overwhelmed: 'bg-red-700',
  bored: 'bg-gray-600'
};

const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  motivated: '💪',
  confident: '😎',
  neutral: '😐',
  tired: '😴',
  stressed: '😰',
  frustrated: '😤',
  sad: '😢',
  anxious: '😟',
  overwhelmed: '🤯',
  bored: '😑'
};

export default function MoodCalendar() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get current date in IST
    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return istDate.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  const isDateSelectable = (date: string) => {
    // Get current date in IST
    const now = new Date();
    const istToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    istToday.setHours(23, 59, 59, 999); // End of IST day
    
    const checkDate = new Date(date + 'T00:00:00');
    return checkDate <= istToday;
  };

  const fetchMoodEntries = async () => {
    try {
      const response = await fetch('/api/mood');
      const result = await response.json();
      setMoodEntries(result.data || []);
    } catch (error) {
      console.error('Failed to fetch mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [moodInsight, setMoodInsight] = useState('');

  const handleMoodSelect = async (selectedMood: MoodEntry['mood']) => {
    try {
      // Ensure the date is in IST before saving
      const dateObj = new Date(selectedDate);
      const istDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const dateToSave = istDate.toISOString().split('T')[0];
      console.log('Saving mood for date:', dateToSave, 'Selected date:', selectedDate);
      
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: dateToSave, 
          mood: selectedMood,
          note
        })
      });

      if (response.ok) {
        await fetchMoodEntries(); // Refresh data
        setShowNoteModal(false);
        setNote('');
      }
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const fetchMoodInsights = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch('/api/mood/insights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });

      if (response.ok) {
        const data = await response.json();
        setMoodInsight(data.insight);
      }
    } catch (error) {
      console.error('Failed to fetch mood insights:', error);
    }
  };

  const getMoodForDate = (date: string) => {
    return moodEntries.find(entry => entry.date.split('T')[0] === date)?.mood;
  };

  const renderCalendar = () => {
    // Get current date in IST
    const today = new Date();
    const ist = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentMonth = ist.getMonth();
    const currentYear = ist.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 p-2">
            {day}
          </div>
        ))}
        
        {/* Blank spaces */}
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="aspect-square" />
        ))}
        
        {/* Days */}
        {days.map(day => {
          const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const mood = getMoodForDate(date);
          const isSelectable = isDateSelectable(date);
          const isSelected = selectedDate === date;
          
          return (
            <button
              key={date}
              onClick={() => isSelectable && setSelectedDate(date)}
              disabled={!isSelectable}
              className={cn(
                "relative aspect-square rounded-lg transition-all duration-200",
                "hover:bg-white/10",
                isSelected && "ring-2 ring-blue-400",
                !isSelectable && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="absolute inset-1 rounded-md overflow-hidden">
                {mood && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute inset-0",
                      moodColors[mood],
                      "opacity-25"
                    )}
                  />
                )}
              </div>
              <span className="relative z-10 text-sm">{day}</span>
              {mood && (
                <span className="absolute bottom-1 right-1 text-xs">
                  {moodEmojis[mood]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const getMoodColor = (mood: string) => {
    return moodColors[mood as keyof typeof moodColors] || 'bg-gray-700';
  };

  const getMoodEmoji = (mood: string) => {
    return moodEmojis[mood as keyof typeof moodEmojis] || '📅';
  };

  const now = new Date();
  const istTime = now.getTime() + (5.5 * 60 * 60 * 1000);
  const today = new Date(istTime);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-400">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 text-sm font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;
              
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const mood = getMoodForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const now = new Date();
              const istTime = now.getTime() + (5.5 * 60 * 60 * 1000);
              const istToday = new Date(istTime).toISOString().split('T')[0];
              const isToday = dateStr === istToday;
              const canSelect = isDateSelectable(dateStr);

              return (
                <motion.button
                  key={`day-${currentYear}-${currentMonth}-${day}`}
                  onClick={() => canSelect && setSelectedDate(dateStr)}
                  disabled={!canSelect}
                  className={`aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium ${
                    isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-gray-600 hover:border-gray-500'
                  } ${
                    isToday ? 'ring-2 ring-blue-400/50' : ''
                  } ${
                    mood ? getMoodColor(mood) + '/20' : 'bg-white/5'
                  } ${
                    !canSelect ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={canSelect ? { scale: 1.05 } : {}}
                  whileTap={canSelect ? { scale: 0.95 } : {}}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-white">{day}</span>
                    {mood && (
                      <span className="text-xs">{getMoodEmoji(mood)}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-6">
        <GlassCard>
          <h3 className="text-xl font-semibold text-blue-400 mb-4">Mood for {new Date(selectedDate).toLocaleDateString()}</h3>
          <p className="text-gray-300 text-sm mb-4">
            How are you feeling on this day?
          </p>
          <div className="space-y-3">
            {[
              { mood: 'happy', emoji: '😊', label: 'Happy', color: 'bg-green-500' },
              { mood: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-orange-500' },
              { mood: 'motivated', emoji: '💪', label: 'Motivated', color: 'bg-blue-500' },
              { mood: 'confident', emoji: '😎', label: 'Confident', color: 'bg-purple-500' },
              { mood: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
              { mood: 'tired', emoji: '😴', label: 'Tired', color: 'bg-gray-500' },
              { mood: 'stressed', emoji: '😰', label: 'Stressed', color: 'bg-red-500' },
              { mood: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'bg-red-600' },
              { mood: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-600' },
              { mood: 'anxious', emoji: '😟', label: 'Anxious', color: 'bg-yellow-600' },
              { mood: 'overwhelmed', emoji: '🤯', label: 'Overwhelmed', color: 'bg-red-700' },
              { mood: 'bored', emoji: '😑', label: 'Bored', color: 'bg-gray-600' }
            ].map(({ mood, emoji, label, color }) => (
              <motion.button
                key={mood}
                onClick={() => handleMoodSelect(mood as any)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                  getMoodForDate(selectedDate) === mood 
                    ? `${color}/20 border-current` 
                    : 'border-gray-600 hover:border-gray-500 bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-white font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-semibold text-blue-400 mb-4">Mood Insights</h3>
          <div className="space-y-3">
            {Object.entries(
              moodEntries.reduce((acc: Record<string, number>, entry) => {
                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                return acc;
              }, {})
            ).map(([mood, count]) => {
              const percentage = moodEntries.length > 0 ? (count / moodEntries.length) * 100 : 0;
              
              return (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMoodEmoji(mood)}</span>
                    <span className="text-gray-300 capitalize">{mood}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getMoodColor(mood)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Monthly AI Insights */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-400">Monthly Analysis</h3>
            <button
              onClick={fetchMoodInsights}
              className="text-sm bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-line">
            {moodInsight || "Click refresh to get AI-powered insights about your mood patterns."}
          </p>
        </GlassCard>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-lg">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Add Note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling today? (Optional)"
              className="w-full h-32 bg-white/5 border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-blue-400"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}