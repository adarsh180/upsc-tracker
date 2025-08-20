'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, FileText, TestTube, PenTool } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

interface OptionalData {
  lectures: number;
  answerWriting: number;
  pyq: number;
  tests: number;
}

export default function OptionalSection() {
  const [progress, setProgress] = useState<OptionalData>({
    lectures: 0,
    answerWriting: 0,
    pyq: 0,
    tests: 0
  });
  const [activeSection, setActiveSection] = useState<keyof OptionalData | null>(null);

  const sections = [
    { key: 'lectures' as keyof OptionalData, label: 'Lectures', icon: BookOpen, color: 'text-blue-400' },
    { key: 'answerWriting' as keyof OptionalData, label: 'Answer Writing', icon: PenTool, color: 'text-green-400' },
    { key: 'pyq' as keyof OptionalData, label: 'PYQ', icon: FileText, color: 'text-yellow-400' },
    { key: 'tests' as keyof OptionalData, label: 'Tests', icon: TestTube, color: 'text-red-400' }
  ];

  const handleCheckboxToggle = (section: keyof OptionalData, index: number, checked: boolean) => {
    setProgress(prev => ({
      ...prev,
      [section]: checked ? prev[section] + 1 : Math.max(0, prev[section] - 1)
    }));
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-indigo-400 mb-4">Optional Subject</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {sections.map((section) => {
          const percentage = calculateProgress(progress[section.key], 140);
          const Icon = section.icon;
          
          return (
            <div key={section.key} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${section.color}`} />
                <span className="text-sm">{section.label}</span>
              </div>
              <div className={`text-xl font-bold ${section.color}`}>{percentage}%</div>
              <div className="text-xs text-gray-400">{progress[section.key]}/140</div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <motion.div
                  className={`h-1 rounded-full bg-gradient-to-r ${
                    section.key === 'lectures' ? 'from-blue-400 to-blue-600' :
                    section.key === 'answerWriting' ? 'from-green-400 to-green-600' :
                    section.key === 'pyq' ? 'from-yellow-400 to-yellow-600' :
                    'from-red-400 to-red-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <button
                onClick={() => setActiveSection(activeSection === section.key ? null : section.key)}
                className="text-xs mt-2 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                {activeSection === section.key ? 'Hide' : 'Show'}
              </button>
            </div>
          );
        })}
      </div>

      {activeSection && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <h4 className="text-sm font-medium mb-3 capitalize">{activeSection} Checkboxes</h4>
          <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto">
            {Array.from({ length: 140 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCheckboxToggle(activeSection, i, i >= progress[activeSection])}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded"
              >
                {i < progress[activeSection] ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <Circle className="w-3 h-3 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}