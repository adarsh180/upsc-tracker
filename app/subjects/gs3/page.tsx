'use client';

import SubjectPageTemplate from '@/components/SubjectPageTemplate';

export default function GS3SubjectsPage() {
  return (
    <SubjectPageTemplate
      category="GS3"
      title="General Studies 3"
      description="Economy • Disaster Management • Environment • Science & Technology"
      icon={<div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">3</div>}
      gradientClass="from-emerald-500/10 to-teal-500/5"
      borderClass="border-emerald-400/20"
      iconBgClass="from-emerald-500/20 to-teal-500/20"
    />
  );
}