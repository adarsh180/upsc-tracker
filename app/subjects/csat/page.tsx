'use client';

import SubjectPageTemplate from '@/components/SubjectPageTemplate';

export default function CSATSubjectsPage() {
  return (
    <SubjectPageTemplate
      category="CSAT"
      title="CSAT"
      description="Quantitative Aptitude • Logical Reasoning • Reading Comprehension • Decision Making"
      icon={<div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>}
      gradientClass="from-cyan-500/10 to-blue-500/5"
      borderClass="border-cyan-400/20"
      iconBgClass="from-cyan-500/20 to-blue-500/20"
    />
  );
}