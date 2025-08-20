'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, FileText, TestTube, PenTool, Save, RotateCcw } from 'lucide-react';
import GlassCard from './GlassCard';
import { calculateProgress } from '@/lib/utils';

interface OptionalData {
  lectures: boolean[];
  answerWriting: boolean[];
  pyq: boolean[];
  tests: boolean[];
}

export default function OptionalSection() {
  const [progress, setProgress] = useState<OptionalData>({
    lectures: new Array(140).fill(false),
    answerWriting: new Array(140).fill(false),
    pyq: new Array(140).fill(false),
    tests: new Array(140).fill(false)
  });
  const [savedProgress, setSavedProgress] = useState<OptionalData>({
    lectures: new Array(140).fill(false),
    answerWriting: new Array(140).fill(false),
    pyq: new Array(140).fill(false),
    tests: new Array(140).fill(false)
  });
  const [activeSection, setActiveSection] = useState<keyof OptionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/optional');
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const progressData: OptionalData = {
          lectures: new Array(140).fill(false),
          answerWriting: new Array(140).fill(false),
          pyq: new Array(140).fill(false),
          tests: new Array(140).fill(false)
        };
        
        data.forEach(item => {
          const sectionKey = item.section_name.toLowerCase().replace(' ', '') as keyof OptionalData;
          if (progressData[sectionKey]) {
            for (let i = 0; i < item.completed_items; i++) {
              progressData[sectionKey][i] = true;
            }
          }
        });
        
        setProgress(progressData);
        setSavedProgress(JSON.parse(JSON.stringify(progressData)));
      }
    } catch (error) {
      console.error('Failed to fetch optional progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const sections = ['lectures', 'answerWriting', 'pyq', 'tests'] as const;
      
      for (const section of sections) {
        const completedCount = progress[section].filter(Boolean).length;
        const sectionName = section === 'answerWriting' ? 'Answer Writing' : 
                           section === 'pyq' ? 'PYQ' : 
                           section.charAt(0).toUpperCase() + section.slice(1);
        
        await fetch('/api/optional', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_name: sectionName,
            completed_items: completedCount
          })
        });
      }
      
      setSavedProgress(JSON.parse(JSON.stringify(progress)));
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setProgress(JSON.parse(JSON.stringify(savedProgress)));
  };

  const hasChanges = JSON.stringify(progress) !== JSON.stringify(savedProgress);

  const sections = [
    { key: 'lectures' as keyof OptionalData, label: 'Lectures', icon: BookOpen, color: 'text-blue-400' },
    { key: 'answerWriting' as keyof OptionalData, label: 'Answer Writing', icon: PenTool, color: 'text-green-400' },
    { key: 'pyq' as keyof OptionalData, label: 'PYQ', icon: FileText, color: 'text-yellow-400' },
    { key: 'tests' as keyof OptionalData, label: 'Tests', icon: TestTube, color: 'text-red-400' }
  ];

  const handleCheckboxToggle = (section: keyof OptionalData, index: number) => {
    setProgress(prev => ({
      ...prev,
      [section]: prev[section].map((checked, i) => i === index ? !checked : checked)
    }));
  };

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold text-indigo-400 mb-4">Optional Subject</h3>
      
      {hasChanges && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetChanges}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {sections.map((section) => {
          const completedCount = progress[section.key].filter(Boolean).length;
          const percentage = calculateProgress(completedCount, 140);
          const Icon = section.icon;
          
          return (
            <div key={section.key} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${section.color}`} />
                <span className="text-sm">{section.label}</span>
              </div>
              <div className={`text-xl font-bold ${section.color}`}>{percentage}%</div>
              <div className="text-xs text-gray-400">{completedCount}/140</div>
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
                onClick={() => handleCheckboxToggle(activeSection, i)}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded transition-colors"
                title={`Item ${i + 1}`}
              >
                {progress[activeSection][i] ? (
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