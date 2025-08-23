'use client';

import SubjectPageTemplate from '@/components/SubjectPageTemplate';

export default function GS2SubjectsPage() {
  return (
    <SubjectPageTemplate
      category="GS2"
      title="General Studies 2"
      description="Polity • Governance • International Relations • Internal Security"
      icon={<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">2</div>}
      gradientClass="from-blue-500/10 to-indigo-500/5"
      borderClass="border-blue-400/20"
      iconBgClass="from-blue-500/20 to-indigo-500/20"
    />
  );
}