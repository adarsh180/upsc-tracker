'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import GlassCard from './GlassCard';

const StudyTimer = dynamic(() => import('./StudyTimer'), { 
  ssr: false,
  loading: () => <GlassCard className="animate-pulse h-32"><div /></GlassCard>
});

const QuestionBank = dynamic(() => import('./QuestionBank'), { 
  ssr: false,
  loading: () => <GlassCard className="animate-pulse h-64"><div /></GlassCard>
});

const CurrentAffairs = dynamic(() => import('./CurrentAffairs'), { 
  ssr: false,
  loading: () => <GlassCard className="animate-pulse h-96"><div /></GlassCard>
});

const AdvancedAnalytics = dynamic(() => import('./AdvancedAnalytics'), { 
  ssr: false,
  loading: () => <GlassCard className="animate-pulse h-80"><div /></GlassCard>
});

export default function LazyDashboard() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<GlassCard className="animate-pulse h-32"><div /></GlassCard>}>
        <StudyTimer />
      </Suspense>
      
      <Suspense fallback={<GlassCard className="animate-pulse h-64"><div /></GlassCard>}>
        <QuestionBank />
      </Suspense>
      
      <Suspense fallback={<GlassCard className="animate-pulse h-96"><div /></GlassCard>}>
        <CurrentAffairs />
      </Suspense>
      
      <Suspense fallback={<GlassCard className="animate-pulse h-80"><div /></GlassCard>}>
        <AdvancedAnalytics />
      </Suspense>
    </div>
  );
}