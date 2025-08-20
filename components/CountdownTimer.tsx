'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  if (!mounted) {
    return (
      <GlassCard className="text-center" glow>
        <motion.h3 className={`text-xl font-bold mb-4 ${color}`}>
          {examName}
        </motion.h3>
        <div className="grid grid-cols-4 gap-4">
          {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-bold ${color} mb-1`}>00</div>
              <div className="text-sm text-gray-300">{label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="text-center" glow>
      <motion.h3 
        className={`text-xl font-bold mb-4 ${color}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {examName}
      </motion.h3>
      
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((unit, index) => (
          <motion.div
            key={unit.label}
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className={`text-3xl font-bold ${color} mb-1`}>
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-300">{unit.label}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}