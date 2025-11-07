// Authentic UPSC CSE Data for Realistic Predictions
export const UPSC_DATA = {
  // Historical Cut-offs (General Category)
  cutoffs: {
    2023: { prelims: 75.41, mains: 741, final: 953 },
    2022: { prelims: 88.22, mains: 748, final: 960 },
    2021: { prelims: 87.54, mains: 745, final: 953 },
    2020: { prelims: 92.51, mains: 736, final: 944 },
    2019: { prelims: 98.00, mains: 751, final: 961 },
    2018: { prelims: 98.00, mains: 774, final: 982 },
    2017: { prelims: 105.34, mains: 809, final: 1006 }
  },

  // Subject-wise Scoring Patterns (Out of 250 each)
  subjectScoring: {
    essay: { average: [80, 130], toppers: [150, 180] },
    gs1: { average: [70, 120], toppers: [130, 150] },
    gs2: { average: [65, 110], toppers: [125, 145] },
    gs3: { average: [75, 125], toppers: [135, 155] },
    gs4: { average: [60, 105], toppers: [120, 140] },
    optional: { average: [180, 280], toppers: [350, 450] }, // Out of 500
    interview: { average: [140, 180], toppers: [200, 230] } // Out of 275
  },

  // Optional Subject Success Rates (2021 Data)
  optionalSuccess: {
    psir: { appeared: 1571, recommended: 140, successRate: 8.9 },
    anthropology: { appeared: 1159, recommended: 90, successRate: 7.8 },
    sociology: { appeared: 1087, recommended: 92, successRate: 8.5 },
    geography: { appeared: 1079, recommended: 66, successRate: 6.1 },
    history: { appeared: 574, recommended: 25, successRate: 4.4 },
    publicAdmin: { appeared: 361, recommended: 31, successRate: 8.6 },
    commerce: { appeared: 140, recommended: 21, successRate: 15.0 },
    law: { appeared: 180, recommended: 21, successRate: 11.7 }
  },

  // Preparation Timeline Benchmarks
  timeline: {
    sixMonthsBefore: {
      expectedCompletion: 70, // First reading complete
      focus: 'Complete first reading, start current affairs integration'
    },
    threeMonthsBefore: {
      expectedCompletion: 85, // Revision phase
      focus: 'Prelims revision, daily mock tests'
    },
    oneMonthBefore: {
      expectedCompletion: 95, // Final revision
      focus: 'Rapid revision, accuracy improvement'
    }
  },

  // Topper Patterns
  topperPatterns: {
    studyHours: { initial: [6, 8], final: [10, 12] },
    revisionCycles: [3, 5],
    answerWriting: 'daily',
    mockTestCorrelation: 'low', // Mock scores don't directly correlate
    mainsBoost: [10, 15] // Mains scores typically 10-15 marks higher than mocks
  },

  // Competition Statistics
  competition: {
    totalRegistrations: 1000000, // Approximate
    vacancies: 1000, // Approximate
    successRate: 0.1, // 0.1%
    categoryDistribution: {
      general: 0.4,
      obc: 0.27,
      sc: 0.15,
      st: 0.075,
      ews: 0.1
    }
  }
};

// Realistic Score Calculation Functions
export function calculateRealisticScore(completion: number, testPerformance: number, subject: string): number {
  const scoring = UPSC_DATA.subjectScoring[subject as keyof typeof UPSC_DATA.subjectScoring];
  if (!scoring) return 0;

  const [minAvg, maxAvg] = scoring.average;
  const [minTop, maxTop] = scoring.toppers;

  // Base score from completion and test performance
  const baseScore = (completion * 0.6) + (testPerformance * 0.4);
  
  // Map to realistic UPSC scoring range
  if (baseScore >= 90) {
    return Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  } else if (baseScore >= 75) {
    return Math.floor(Math.random() * (maxAvg - minAvg + 1)) + maxAvg;
  } else if (baseScore >= 60) {
    return Math.floor(Math.random() * (maxAvg - minAvg + 1)) + minAvg;
  } else {
    return Math.floor(Math.random() * minAvg) + 40;
  }
}

export function calculateRealisticRank(totalScore: number, category: string = 'general'): number {
  const cutoffs = Object.values(UPSC_DATA.cutoffs);
  const avgCutoff = cutoffs.reduce((sum, c) => sum + c.final, 0) / cutoffs.length;
  
  // Harsh realistic ranking based on actual UPSC patterns
  if (totalScore >= avgCutoff + 100) return Math.floor(Math.random() * 100) + 1; // Top 100
  else if (totalScore >= avgCutoff + 50) return Math.floor(Math.random() * 500) + 100; // 100-600
  else if (totalScore >= avgCutoff) return Math.floor(Math.random() * 2000) + 600; // 600-2600
  else if (totalScore >= avgCutoff - 50) return Math.floor(Math.random() * 10000) + 2600; // 2600-12600
  else if (totalScore >= avgCutoff - 100) return Math.floor(Math.random() * 50000) + 12600; // 12600-62600
  else return Math.floor(Math.random() * 400000) + 62600; // Below average
}

export function getTimelineExpectation(daysToExam: number): { expectedCompletion: number; focus: string } {
  if (daysToExam >= 180) return UPSC_DATA.timeline.sixMonthsBefore;
  else if (daysToExam >= 90) return UPSC_DATA.timeline.threeMonthsBefore;
  else return UPSC_DATA.timeline.oneMonthBefore;
}

export function getPSIRBenchmark(): { averageScore: number; topperScore: number; successRate: number } {
  const psir = UPSC_DATA.optionalSuccess.psir;
  const scoring = UPSC_DATA.subjectScoring.optional;
  
  return {
    averageScore: (scoring.average[0] + scoring.average[1]) / 2,
    topperScore: (scoring.toppers[0] + scoring.toppers[1]) / 2,
    successRate: psir.successRate
  };
}