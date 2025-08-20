'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, FileText, RotateCcw, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import { SubjectProgress } from '@/types';
import { calculateProgress } from '@/lib/utils';

interface SubjectCardProps {
  subject: SubjectProgress;
  onUpdate: (id: number, field: string, value: number) => void;
}



export default function SubjectCard({ subject, onUpdate }: SubjectCardProps) {
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ 
    total_lectures: subject.total_lectures, 
    total_dpps: subject.total_dpps 
  });
  const [pendingProgress, setPendingProgress] = useState({ 
    completed_lectures: subject.completed_lectures, 
    completed_dpps: subject.completed_dpps 
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCounts, setEditingCounts] = useState(false);
  
  const lectureProgress = calculateProgress(pendingProgress.completed_lectures, pendingCounts.total_lectures);
  const dppProgress = calculateProgress(pendingProgress.completed_dpps, pendingCounts.total_dpps);

  const handleCheckboxToggle = (type: 'lecture' | 'dpp', index: number) => {
    if (type === 'lecture') {
      const newCompleted = index + 1;
      setPendingProgress(prev => ({ ...prev, completed_lectures: newCompleted }));
    } else {
      const newCompleted = index + 1;
      setPendingProgress(prev => ({ ...prev, completed_dpps: newCompleted }));
    }
    setHasChanges(true);
  };

  const handleCountChange = (field: 'total_lectures' | 'total_dpps', value: number) => {
    setPendingCounts(prev => ({ ...prev, [field]: Math.max(1, value) }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Batch update all changes
      const response = await fetch('/api/subjects/update/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subject.id,
          updates: {
            total_lectures: pendingCounts.total_lectures,
            total_dpps: pendingCounts.total_dpps,
            completed_lectures: pendingProgress.completed_lectures,
            completed_dpps: pendingProgress.completed_dpps
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      const result = await response.json();
      
      // Update parent component with new data
      onUpdate(subject.id, 'total_lectures', result.data.total_lectures);
      onUpdate(subject.id, 'total_dpps', result.data.total_dpps);
      onUpdate(subject.id, 'completed_lectures', result.data.completed_lectures);
      onUpdate(subject.id, 'completed_dpps', result.data.completed_dpps);
      
      // Update local state with the server response
      setPendingCounts({
        total_lectures: result.data.total_lectures,
        total_dpps: result.data.total_dpps
      });
      setPendingProgress({
        completed_lectures: result.data.completed_lectures,
        completed_dpps: result.data.completed_dpps
      });
      
      setHasChanges(false);
      setConfiguring(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleReset = () => {
    setPendingCounts({ total_lectures: subject.total_lectures, total_dpps: subject.total_dpps });
    setPendingProgress({ completed_lectures: subject.completed_lectures, completed_dpps: subject.completed_dpps });
    setHasChanges(false);
  };

  const handleTotalCountUpdate = (type: 'lecture' | 'dpp', value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === 'lecture') {
      onUpdate(subject.id, 'total_lectures', Math.max(0, numValue));
    } else {
      onUpdate(subject.id, 'total_dpps', Math.max(0, numValue));
    }
  };

  return (
    <GlassCard className="relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-blue-400">{subject.subject}</h3>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400 bg-white/10 px-2 py-1 rounded">
            {subject.category}
          </span>
          <button
            onClick={() => setConfiguring(!configuring)}
            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
          >
            {configuring ? 'Apply Configuration' : 'Configure Counts'}
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Lectures</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{lectureProgress}%</div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>{pendingProgress.completed_lectures}/</span>
            {configuring ? (
              <input
                type="number"
                min="1"
                value={pendingCounts.total_lectures}
                onChange={(e) => handleCountChange('total_lectures', parseInt(e.target.value))}
                className="w-12 bg-gray-800 border border-gray-600 rounded px-1 text-white text-center"
              />
            ) : (
              <span>{pendingCounts.total_lectures}</span>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm">DPPs</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{dppProgress}%</div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>{pendingProgress.completed_dpps}/</span>
            {configuring ? (
              <input
                type="number"
                min="1"
                value={pendingCounts.total_dpps}
                onChange={(e) => handleCountChange('total_dpps', parseInt(e.target.value))}
                className="w-12 bg-gray-800 border border-gray-600 rounded px-1 text-white text-center"
              />
            ) : (
              <span>{pendingCounts.total_dpps}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Lectures</span>
            <span>{lectureProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${lectureProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>DPPs</span>
            <span>{dppProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dppProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-green-400" />
          <span className="text-sm">Revisions: {subject.revisions}</span>
        </div>
        <button
          onClick={() => onUpdate(subject.id, 'revisions', subject.revisions + 1)}
          className="text-xs bg-green-500/20 hover:bg-green-500/30 px-2 py-1 rounded transition-colors"
        >
          +1 Revision
        </button>
      </div>

      {/* Save/Reset Buttons */}
      {hasChanges && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 py-2 rounded transition-colors text-sm"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 py-2 rounded transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      )}

      {/* Configuration and Checkboxes Controls */}
      <div className="flex flex-col gap-2">
        {!configuring && (
          <button
            onClick={() => setShowCheckboxes(!showCheckboxes)}
            className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors text-sm"
          >
            {showCheckboxes ? 'Hide' : 'Show'} Checkboxes
          </button>
        )}

        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 py-2 rounded transition-colors text-sm"
            >
              Save All Changes
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 py-2 rounded transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Checkboxes */}
      {!configuring && showCheckboxes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4 max-h-60 overflow-y-auto"
        >
          <div>
            <h4 className="text-sm font-medium mb-2 text-blue-400">Lectures</h4>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: pendingCounts.total_lectures }, (_, i) => (
                <button
                  key={`lecture-${i}`}
                  onClick={() => handleCheckboxToggle('lecture', i)}
                  className="flex items-center justify-center p-1 hover:bg-white/10 rounded text-xs min-w-[24px] h-6"
                  title={`Lecture ${i + 1}`}
                >
                  {i < pendingProgress.completed_lectures ? (
                    <span className="text-green-400 font-bold">{i + 1}</span>
                  ) : (
                    <span className="text-gray-400">{i + 1}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 text-blue-400">DPPs</h4>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: pendingCounts.total_dpps }, (_, i) => (
                <button
                  key={`dpp-${i}`}
                  onClick={() => handleCheckboxToggle('dpp', i)}
                  className="flex items-center justify-center p-1 hover:bg-white/10 rounded text-xs min-w-[24px] h-6"
                  title={`DPP ${i + 1}`}
                >
                  {i < pendingProgress.completed_dpps ? (
                    <span className="text-green-400 font-bold">{i + 1}</span>
                  ) : (
                    <span className="text-gray-400">{i + 1}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}