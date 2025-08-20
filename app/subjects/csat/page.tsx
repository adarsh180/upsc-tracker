'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import SubjectCard from '@/components/SubjectCard';
import { SubjectProgress } from '@/types';

export default function CSATSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      
      // Filter CSAT subjects and ensure uniqueness
      const csatSubjects = data.filter((s: SubjectProgress) => s.category === 'CSAT');
      const uniqueSubjects = Object.values(
        csatSubjects.reduce((acc: { [key: string]: SubjectProgress }, curr: SubjectProgress) => {
          const key = `${curr.category}-${curr.subject}`;
          if (!acc[key] || curr.id < (acc[key].id || Infinity)) {
            acc[key] = curr;
          }
          return acc;
        }, {})
      ) as SubjectProgress[];
      
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectUpdate = async (id: number, field: string, value: number) => {
    try {
      await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });

      setSubjects(prev => prev.map(subject => 
        subject.id === id ? { ...subject, [field]: value } : subject
      ));
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
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
            <h1 className="text-4xl font-bold gradient-text">CSAT</h1>
            <p className="text-gray-300 mt-2">Quantitative Aptitude, Logical Reasoning, Reading Comprehension</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <SubjectCard
              subject={subject}
              onUpdate={handleSubjectUpdate}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}