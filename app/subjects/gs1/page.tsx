'use client';

import SubjectPageTemplate from '@/components/SubjectPageTemplate';

export default function GS1SubjectsPage() {
  return (
    <SubjectPageTemplate
      category="GS1"
      title="General Studies 1"
      description="Ancient History • Modern History • World History • Geography • Society • Art & Culture"
      icon={<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>}
      gradientClass="from-indigo-500/10 to-blue-500/5"
      borderClass="border-indigo-400/20"
      iconBgClass="from-indigo-500/20 to-blue-500/20"
    />
  );
}