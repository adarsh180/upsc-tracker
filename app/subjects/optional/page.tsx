'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, TestTube, PenTool, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

interface OptionalData {
  lectures: boolean[];
  answerWriting: boolean[];
  pyq: boolean[];
  tests: boolean[];
}

export default function OptionalSubjectsPage() {
  const [progress, setProgress] = useState<OptionalData>({
    lectures: new Array(140).fill(false),
    answerWriting: new Array(140).fill(false),
    pyq: new Array(140).fill(false),
    tests: new Array(500).fill(false)
  });
  const [savedProgress, setSavedProgress] = useState<OptionalData>({
    lectures: new Array(140).fill(false),
    answerWriting: new Array(140).fill(false),
    pyq: new Array(140).fill(false),
    tests: new Array(500).fill(false)
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
          tests: new Array(500).fill(false)
        };
        
        data.forEach(item => {
          let sectionKey: keyof OptionalData;
          if (item.section_name === 'Answer Writing') sectionKey = 'answerWriting';
          else if (item.section_name === 'PYQ') sectionKey = 'pyq';
          else sectionKey = item.section_name.toLowerCase() as keyof OptionalData;
          
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
    { key: 'lectures' as keyof OptionalData, label: 'Lectures', icon: BookOpen, color: 'text-blue-400', total: 140 },
    { key: 'answerWriting' as keyof OptionalData, label: 'Answer Writing', icon: PenTool, color: 'text-green-400', total: 140 },
    { key: 'pyq' as keyof OptionalData, label: 'PYQ', icon: FileText, color: 'text-yellow-400', total: 140 },
    { key: 'tests' as keyof OptionalData, label: 'Tests', icon: TestTube, color: 'text-red-400', total: 500 }
  ];

  const handleCheckboxToggle = (section: keyof OptionalData, index: number) => {
    setProgress(prev => ({
      ...prev,
      [section]: prev[section].map((checked, i) => i === index ? !checked : checked)
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

      {hasChanges && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetChanges}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {sections.map((section) => {
          const completedCount = progress[section.key].filter(Boolean).length;
          const percentage = calculateProgress(completedCount, section.total);
          const Icon = section.icon;
          
          return (
            <GlassCard key={section.key}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-6 h-6 ${section.color}`} />
                <h3 className={`text-xl font-semibold ${section.color}`}>{section.label}</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${section.color} mb-2`}>{percentage}%</div>
                <div className="text-sm text-gray-400">{completedCount}/{section.total} completed</div>
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
            {Array.from({ length: sections.find(s => s.key === activeSection)?.total || 140 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCheckboxToggle(activeSection, i)}
                className="flex items-center justify-center p-1 hover:bg-white/10 rounded transition-colors"
                title={`${activeSection} ${i + 1}`}
              >
                {progress[activeSection][i] ? (
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