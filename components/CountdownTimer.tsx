'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { getTimeUntilExam } from '@/lib/utils';
import GlassCard from './GlassCard';

interface CountdownTimerProps {
  examName: string;
  examDate: string;
  color: string;
}

export default function CountdownTimer({ examName, examDate, color }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeUntilExam(examDate));
    
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilExam(examDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

  const getGradientClass = () => {
    if (color.includes('indigo')) return 'from-indigo-500/20 to-blue-500/10';
    if (color.includes('purple')) return 'from-purple-500/20 to-pink-500/10';
    return 'from-blue-500/20 to-indigo-500/10';
  };

  const getIconColor = () => {
    if (color.includes('indigo')) return 'text-indigo-400';
    if (color.includes('purple')) return 'text-purple-400';
    return 'text-blue-400';
  };

  if (!mounted) {
    return (
      <GlassCard 
        className={`text-center bg-gradient-to-br ${getGradientClass()} border-white/10`}
        variant="premium"
        glow
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Calendar className={`w-5 h-5 ${getIconColor()}`} />
          <h3 className={`text-lg font-bold ${color}`}>
            {examName}
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
            <div key={label} className="text-center">
              <div className="skeleton h-12 w-full mb-2 rounded-lg" />
              <div className="text-xs text-neutral-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className={`text-center bg-gradient-to-br ${getGradientClass()} border-white/10 hover:border-white/20`}
      variant="premium"
      glow
    >
      <motion.div
        className="flex items-center justify-center gap-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Calendar className={`w-5 h-5 ${getIconColor()}`} />
        <h3 className={`text-lg font-bold ${color}`}>
          {examName}
        </h3>
      </motion.div>
      
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Days', value: timeLeft.days, delay: 0.3 },
          { label: 'Hours', value: timeLeft.hours, delay: 0.4 },
          { label: 'Minutes', value: timeLeft.minutes, delay: 0.5 },
          { label: 'Seconds', value: timeLeft.seconds, delay: 0.6 }
        ].map((unit) => (
          <motion.div
            key={unit.label}
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: unit.delay, type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className={`relative bg-white/5 rounded-xl p-3 mb-2 border border-white/10`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className={`text-2xl md:text-3xl font-black ${color} leading-none`}>
                {unit.value.toString().padStart(2, '0')}
              </div>
              
              {/* Subtle glow effect */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-t ${getGradientClass()} opacity-0 hover:opacity-50 transition-opacity duration-300`} />
            </motion.div>
            
            <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress indicator */}
      <motion.div
        className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Clock className="w-3 h-3" />
        <span>Live countdown • Updates every second</span>
      </motion.div>
    </GlassCard>
  );
}