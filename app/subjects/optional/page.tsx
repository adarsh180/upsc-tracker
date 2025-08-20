'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, TestTube, PenTool } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

interface OptionalData {
  lectures: number;
  answerWriting: number;
  pyq: number;
  tests: number;
}

export default function OptionalSubjectsPage() {
  const [progress, setProgress] = useState<OptionalData>({
    lectures: 0,
    answerWriting: 0,
    pyq: 0,
    tests: 0
  });
  const [activeSection, setActiveSection] = useState<keyof OptionalData | null>(null);

  const sections = [
    { key: 'lectures' as keyof OptionalData, label: 'Lectures', icon: BookOpen, color: 'text-blue-400' },
    { key: 'answerWriting' as keyof OptionalData, label: 'Answer Writing', icon: PenTool, color: 'text-blue-400' },
    { key: 'pyq' as keyof OptionalData, label: 'PYQ', icon: FileText, color: 'text-blue-400' },
    { key: 'tests' as keyof OptionalData, label: 'Tests', icon: TestTube, color: 'text-blue-400' }
  ];

  const handleCheckboxToggle = (section: keyof OptionalData, index: number, checked: boolean) => {
    setProgress(prev => ({
      ...prev,
      [section]: checked ? prev[section] + 1 : Math.max(0, prev[section] - 1)
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <GlassCard className="p-2 cursor-pointer hover:scale-105 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </GlassCard>
          </Link>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Optional Subject</h1>
            <p className="text-gray-300 mt-2">4 sections with 140 checkboxes each</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {sections.map((section) => {
          const percentage = calculateProgress(progress[section.key], 140);
          const Icon = section.icon;
          
          return (
            <GlassCard key={section.key}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-6 h-6 ${section.color}`} />
                <h3 className={`text-xl font-semibold ${section.color}`}>{section.label}</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${section.color} mb-2`}>{percentage}%</div>
                <div className="text-sm text-gray-400">{progress[section.key]}/140 completed</div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <button
                onClick={() => setActiveSection(activeSection === section.key ? null : section.key)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 py-2 rounded transition-colors"
              >
                {activeSection === section.key ? 'Hide' : 'Show'} Checkboxes
              </button>
            </GlassCard>
          );
        })}
      </div>

      {activeSection && (
        <GlassCard>
          <h4 className="text-xl font-semibold mb-4 capitalize text-blue-400">{activeSection} Progress</h4>
          <div className="grid grid-cols-10 gap-1 max-h-96 overflow-y-auto">
            {Array.from({ length: 140 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCheckboxToggle(activeSection, i, i >= progress[activeSection])}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded"
                title={`${activeSection} ${i + 1}`}
              >
                {i < progress[activeSection] ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <Circle className="w-3 h-3 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}