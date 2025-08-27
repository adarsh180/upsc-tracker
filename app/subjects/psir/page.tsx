'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, Users, Globe, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { calculateProgress } from '@/lib/utils';

interface PSIRData {
  politicalTheory: boolean[];
  comparativePolitics: boolean[];
  publicAdministration: boolean[];
  internationalRelations: boolean[];
  lectures: boolean[];
  tests: boolean[];
}

export default function PSIRSubjectsPage() {
  const [progress, setProgress] = useState<PSIRData>({
    politicalTheory: new Array(150).fill(false),
    comparativePolitics: new Array(150).fill(false),
    publicAdministration: new Array(150).fill(false),
    internationalRelations: new Array(150).fill(false),
    lectures: new Array(250).fill(false),
    tests: new Array(500).fill(false)
  });
  const [savedProgress, setSavedProgress] = useState<PSIRData>({
    politicalTheory: new Array(150).fill(false),
    comparativePolitics: new Array(150).fill(false),
    publicAdministration: new Array(150).fill(false),
    internationalRelations: new Array(150).fill(false),
    lectures: new Array(250).fill(false),
    tests: new Array(500).fill(false)
  });
  const [activeSection, setActiveSection] = useState<keyof PSIRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/psir');
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const progressData: PSIRData = {
          politicalTheory: new Array(150).fill(false),
          comparativePolitics: new Array(150).fill(false),
          publicAdministration: new Array(150).fill(false),
          internationalRelations: new Array(150).fill(false),
          lectures: new Array(250).fill(false),
          tests: new Array(500).fill(false)
        };
        
        data.forEach(item => {
          let sectionKey: keyof PSIRData;
          if (item.section_name === 'Political Theory') sectionKey = 'politicalTheory';
          else if (item.section_name === 'Comparative Politics') sectionKey = 'comparativePolitics';
          else if (item.section_name === 'Public Administration') sectionKey = 'publicAdministration';
          else if (item.section_name === 'International Relations') sectionKey = 'internationalRelations';
          else if (item.section_name === 'Lectures') sectionKey = 'lectures';
          else if (item.section_name === 'Tests') sectionKey = 'tests';
          else return;
          
          for (let i = 0; i < item.completed_items; i++) {
            progressData[sectionKey][i] = true;
          }
        });
        
        setProgress(progressData);
        setSavedProgress(JSON.parse(JSON.stringify(progressData)));
      }
    } catch (error) {
      console.error('Failed to fetch PSIR progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const sections = ['politicalTheory', 'comparativePolitics', 'publicAdministration', 'internationalRelations', 'lectures', 'tests'] as const;
      
      for (const section of sections) {
        const completedCount = progress[section].filter(Boolean).length;
        const sectionName = section === 'politicalTheory' ? 'Political Theory' :
                           section === 'comparativePolitics' ? 'Comparative Politics' :
                           section === 'publicAdministration' ? 'Public Administration' :
                           section === 'internationalRelations' ? 'International Relations' :
                           section.charAt(0).toUpperCase() + section.slice(1);
        
        await fetch('/api/psir', {
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
    { key: 'politicalTheory' as keyof PSIRData, label: 'Political Theory', icon: BookOpen, color: 'text-blue-400', total: 150 },
    { key: 'comparativePolitics' as keyof PSIRData, label: 'Comparative Politics', icon: Users, color: 'text-green-400', total: 150 },
    { key: 'publicAdministration' as keyof PSIRData, label: 'Public Administration', icon: FileText, color: 'text-yellow-400', total: 150 },
    { key: 'internationalRelations' as keyof PSIRData, label: 'International Relations', icon: Globe, color: 'text-red-400', total: 150 },
    { key: 'lectures' as keyof PSIRData, label: 'Lectures', icon: BookOpen, color: 'text-purple-400', total: 250 },
    { key: 'tests' as keyof PSIRData, label: 'Tests', icon: FileText, color: 'text-pink-400', total: 500 }
  ];

  const handleCheckboxToggle = (section: keyof PSIRData, index: number) => {
    setProgress(prev => ({
      ...prev,
      [section]: prev[section].map((checked, i) => i === index ? !checked : checked)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold gradient-text">PSIR</h1>
            <p className="text-gray-300 mt-2">Political Science & International Relations - 4 core sections + 250 lectures + 500 tests</p>
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                  className={`h-3 rounded-full bg-gradient-to-r ${
                    section.key === 'politicalTheory' ? 'from-blue-400 to-blue-600' :
                    section.key === 'comparativePolitics' ? 'from-green-400 to-green-600' :
                    section.key === 'publicAdministration' ? 'from-yellow-400 to-yellow-600' :
                    section.key === 'internationalRelations' ? 'from-red-400 to-red-600' :
                    section.key === 'lectures' ? 'from-purple-400 to-purple-600' :
                    'from-pink-400 to-pink-600'
                  }`}
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
            {Array.from({ length: sections.find(s => s.key === activeSection)?.total || 150 }, (_, i) => (
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