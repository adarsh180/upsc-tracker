'use client';

import SubjectPageTemplate from '@/components/SubjectPageTemplate';

export default function GS4SubjectsPage() {
  return (
    <SubjectPageTemplate
      category="GS4"
      title="General Studies 4"
      description="Ethics • Integrity • Aptitude • Case Studies"
      icon={<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">4</div>}
      gradientClass="from-purple-500/10 to-pink-500/5"
      borderClass="border-purple-400/20"
      iconBgClass="from-purple-500/20 to-pink-500/20"
    />
  );
}