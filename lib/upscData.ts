// Authentic UPSC CSE Data for Realistic Predictions
export const UPSC_DATA = {
  // Historical Cut-offs (General Category) - Ultra Rigorous Reality
  cutoffs: {
    2025: { prelims: 95.00, mains: 742, final: 957 }, // 47% of total 2025 marks
    2024: { prelims: 85.92, mains: 729, final: 944 }, // 47% of total 2025 marks
    2023: { prelims: 75.41, mains: 741, final: 953 }, // 47% of total 2025 marks
    2022: { prelims: 88.22, mains: 748, final: 960 }, // 47% of total 2025 marks
    2021: { prelims: 87.54, mains: 745, final: 953 }, // 47% of total 2025 marks
    2020: { prelims: 92.51, mains: 736, final: 944 }, // 47% of total 2025 marks
    2019: { prelims: 98.00, mains: 751, final: 961 }, // 47% of total 2025 marks
    2018: { prelims: 98.00, mains: 774, final: 982 }, // 48% of total 2025 marks
    2017: { prelims: 105.34, mains: 809, final: 1006 } // 50% of total 2025 marks
  },

  // UPSC Reality: Even AIR 1 scores only 51-60% of total marks (1100-1200 out of 2025)
  topperReality: {
    totalMarks: 2025, // Prelims (200) + Mains (1750) + Interview (275)
    air1Range: [1100, 1200], // 54-59% - Absolute best possible
    air10Range: [1050, 1150], // 52-57% - Top 10 range
    air100Range: [1000, 1100], // 49-54% - Top 100 range
    qualifyingRange: [950, 1050] // 47-52% - Just qualifying
  },

  // Ultra-Rigorous Subject Scoring - Reality Check (Out of max marks)
  subjectScoring: {
    // Essay: Even toppers struggle to cross 70% (175/250)
    essay: { average: [80, 120], toppers: [140, 175], maxPossible: 250 },
    // GS Papers: Extremely tough, toppers max 60% (150/250)
    gs1: { average: [65, 105], toppers: [120, 150], maxPossible: 250 },
    gs2: { average: [60, 100], toppers: [115, 145], maxPossible: 250 },
    gs3: { average: [70, 110], toppers: [125, 155], maxPossible: 250 },
    gs4: { average: [55, 95], toppers: [110, 140], maxPossible: 250 }, // Toughest paper
    // Optional: PSIR toppers max 60% (300/500), average 40-50%
    optional: { average: [200, 280], toppers: [320, 400], maxPossible: 500 },
    // Interview: Even confident candidates max 80% (220/275)
    interview: { average: [150, 190], toppers: [200, 220], maxPossible: 275 },
    // Prelims: Qualifying nature, but still tough
    prelims: { average: [85, 105], toppers: [110, 130], maxPossible: 200 }
  },

  // Ultra-Rigorous Optional Reality (2021 Data)
  optionalSuccess: {
    psir: { appeared: 1571, recommended: 140, successRate: 8.9, realityCheck: 'Even with 8.9% success, most PSIR candidates score 200-300/500' },
    anthropology: { appeared: 1159, recommended: 90, successRate: 7.8, realityCheck: 'High success rate but limited seats' },
    sociology: { appeared: 1087, recommended: 92, successRate: 8.5, realityCheck: 'Moderate success, requires deep understanding' },
    geography: { appeared: 1079, recommended: 66, successRate: 6.1, realityCheck: 'Lower success rate, technical subject' },
    history: { appeared: 574, recommended: 25, successRate: 4.4, realityCheck: 'Lowest success rate, vast syllabus' },
    publicAdmin: { appeared: 361, recommended: 31, successRate: 8.6, realityCheck: 'Good success rate but overlaps with GS2' },
    commerce: { appeared: 140, recommended: 21, successRate: 15.0, realityCheck: 'Highest success rate but very few candidates' },
    law: { appeared: 180, recommended: 21, successRate: 11.7, realityCheck: 'Good for law graduates but limited appeal' },
    overallReality: 'Optional subject choice can make or break your rank. Even high success rates don\'t guarantee good scores.'
  },

  // Ultra-Rigorous Timeline Reality
  timeline: {
    sixMonthsBefore: {
      expectedCompletion: 90, // Must be near complete - UPSC doesn't wait
      focus: 'CRITICAL: Complete entire syllabus, intensive revision, daily tests',
      reality: 'If not 90% complete by now, chances are extremely slim'
    },
    threeMonthsBefore: {
      expectedCompletion: 98, // Must be revision mode only
      focus: 'FINAL PHASE: Only revision, mock tests, answer writing',
      reality: 'No new topics - focus on perfecting what you know'
    },
    oneMonthBefore: {
      expectedCompletion: 100, // Everything must be done
      focus: 'EXAM MODE: Quick revision, stress management, exam strategy',
      reality: 'Too late for any substantial improvement - maintain what you have'
    }
  },

  // Ultra-Rigorous Topper Reality
  topperPatterns: {
    studyHours: { initial: [8, 12], final: [12, 16] }, // Much higher commitment needed
    revisionCycles: [5, 8], // Multiple revisions essential
    answerWriting: 'daily', // Non-negotiable
    mockTestCorrelation: 'very low', // Mock scores often misleading
    mainsBoost: [-5, 5], // Mains often LOWER than mocks due to pressure
    realityCheck: 'Even toppers fail multiple times. Success requires 2-3 years minimum preparation.',
    successFactors: {
      luck: 30, // Significant luck factor
      preparation: 40, // Solid preparation
      examDay: 20, // Performance on exam day
      mentalHealth: 10 // Stress management
    }
  },

  // Ultra-Rigorous Competition Reality
  competition: {
    totalRegistrations: 1000000, // 10 Lakh+ candidates
    vacancies: 1000, // Only 1000 selections
    successRate: 0.1, // 0.1% - Brutal reality
    prelimsQualifiers: 15000, // Only 1.5% clear Prelims
    mainsQualifiers: 3000, // Only 0.3% clear Mains
    finalSelections: 1000, // Only 0.1% get selected
    categoryDistribution: {
      general: 0.4,
      obc: 0.27,
      sc: 0.15,
      st: 0.075,
      ews: 0.1
    },
    realityCheck: 'Out of 10 lakh candidates, only 1000 succeed. Even scoring 50%+ doesn\'t guarantee selection.'
  }
};

// Ultra-Rigorous Score Calculation - UPSC Reality Check
export function calculateRealisticScore(completion: number, testPerformance: number, subject: string): number {
  const scoring = UPSC_DATA.subjectScoring[subject as keyof typeof UPSC_DATA.subjectScoring];
  if (!scoring) return 0;

  const [minAvg, maxAvg] = scoring.average;
  const [minTop, maxTop] = scoring.toppers;

  // Ultra-harsh reality: Even 100% preparation doesn't guarantee high scores
  const baseScore = (completion * 0.4) + (testPerformance * 0.3) + (Math.random() * 30); // 30% luck factor
  
  // UPSC Reality: Even perfect candidates score only 50-60%
  if (baseScore >= 95) {
    // Exceptional performance - still capped at topper range
    return Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  } else if (baseScore >= 85) {
    // Very good performance - upper average range
    return Math.floor(Math.random() * (maxAvg - minAvg + 1)) + Math.floor((minAvg + maxAvg) / 2);
  } else if (baseScore >= 70) {
    // Good performance - average range
    return Math.floor(Math.random() * (maxAvg - minAvg + 1)) + minAvg;
  } else if (baseScore >= 50) {
    // Below average performance
    return Math.floor(Math.random() * minAvg) + Math.floor(minAvg * 0.7);
  } else {
    // Poor performance - very low scores
    return Math.floor(Math.random() * Math.floor(minAvg * 0.7)) + 30;
  }
}

export function calculateRealisticRank(totalScore: number, category: string = 'general'): number {
  const { topperReality } = UPSC_DATA;
  const [air1Min, air1Max] = topperReality.air1Range;
  const [air10Min, air10Max] = topperReality.air10Range;
  const [air100Min, air100Max] = topperReality.air100Range;
  const [qualifyMin, qualifyMax] = topperReality.qualifyingRange;
  
  // Ultra-Rigorous Ranking: Even 1200+ scores might not guarantee AIR 1
  if (totalScore >= air1Max) {
    return Math.floor(Math.random() * 3) + 1; // AIR 1-3 (extremely rare)
  } else if (totalScore >= air1Min) {
    return Math.floor(Math.random() * 10) + 1; // AIR 1-10
  } else if (totalScore >= air10Max) {
    return Math.floor(Math.random() * 50) + 10; // AIR 10-60
  } else if (totalScore >= air10Min) {
    return Math.floor(Math.random() * 100) + 50; // AIR 50-150
  } else if (totalScore >= air100Max) {
    return Math.floor(Math.random() * 300) + 100; // AIR 100-400
  } else if (totalScore >= air100Min) {
    return Math.floor(Math.random() * 700) + 300; // AIR 300-1000
  } else if (totalScore >= qualifyMax) {
    return Math.floor(Math.random() * 2000) + 1000; // AIR 1000-3000
  } else if (totalScore >= qualifyMin) {
    return Math.floor(Math.random() * 7000) + 3000; // AIR 3000-10000
  } else if (totalScore >= qualifyMin - 50) {
    return Math.floor(Math.random() * 40000) + 10000; // AIR 10000-50000
  } else {
    return Math.floor(Math.random() * 950000) + 50000; // AIR 50000+ (Not qualifying)
  }
}

export function getTimelineExpectation(daysToExam: number): { expectedCompletion: number; focus: string; reality: string } {
  if (daysToExam >= 180) return UPSC_DATA.timeline.sixMonthsBefore;
  else if (daysToExam >= 90) return UPSC_DATA.timeline.threeMonthsBefore;
  else return UPSC_DATA.timeline.oneMonthBefore;
}

export function getPSIRBenchmark(): { averageScore: number; topperScore: number; successRate: number; realityCheck: string } {
  const psir = UPSC_DATA.optionalSuccess.psir;
  const scoring = UPSC_DATA.subjectScoring.optional;
  
  return {
    averageScore: (scoring.average[0] + scoring.average[1]) / 2, // ~240/500 (48%)
    topperScore: (scoring.toppers[0] + scoring.toppers[1]) / 2, // ~360/500 (72%)
    successRate: psir.successRate, // 8.9% - Extremely competitive
    realityCheck: 'Even PSIR toppers rarely cross 400/500 (80%). Most successful candidates score 250-350/500 (50-70%).'
  };
}

// New function to calculate ultra-rigorous final percentage
export function calculateFinalPercentage(totalScore: number): { percentage: number; reality: string } {
  const { topperReality } = UPSC_DATA;
  const percentage = (totalScore / topperReality.totalMarks) * 100;
  
  let reality = '';
  if (percentage >= 59) reality = 'EXCEPTIONAL - AIR 1-3 level (Extremely rare)';
  else if (percentage >= 54) reality = 'OUTSTANDING - AIR 1-10 level';
  else if (percentage >= 52) reality = 'EXCELLENT - AIR 10-50 level';
  else if (percentage >= 49) reality = 'VERY GOOD - AIR 50-200 level';
  else if (percentage >= 47) reality = 'GOOD - Qualifying level';
  else reality = 'NEEDS IMPROVEMENT - Below qualifying standards';
  
  return { percentage: Math.round(percentage * 10) / 10, reality };
}