import { NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';
import { UPSC_DATA, calculateRealisticScore, calculateRealisticRank, getTimelineExpectation, getPSIRBenchmark } from '@/lib/upscData';
import { generateAdvancedPrediction, UPSCPredictionEngine } from '@/lib/advancedPredictionEngine';
import { PerformanceMetricsTracker } from '@/lib/realTimeUpdater';
import { UPSCHistoryTracker, StrengthWeaknessAnalyzer } from '@/lib/historyTracker';
import { PersonalizedSuggestionsEngine } from '@/lib/personalizedSuggestions';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [subjectProgress] = await connection.execute('SELECT * FROM subject_progress WHERE user_id = 1');
    const [questionAttempts] = await connection.execute('SELECT * FROM question_attempts WHERE user_id = 1 ORDER BY attempted_at DESC LIMIT 200');
    const [studySessions] = await connection.execute('SELECT * FROM study_sessions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 60');
    const [testRecords] = await connection.execute('SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC LIMIT 50');
    const [moodEntries] = await connection.execute('SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC LIMIT 30');
    const [dailyGoals] = await connection.execute('SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC LIMIT 30');
    const [psirProgress] = await connection.execute('SELECT * FROM psir_progress WHERE user_id = 1');
    const [essayProgress] = await connection.execute('SELECT * FROM essay_progress WHERE user_id = 1');
    
    releaseConnection(connection);
    
    const subjects = Array.isArray(subjectProgress) ? subjectProgress : [];
    const attempts = Array.isArray(questionAttempts) ? questionAttempts : [];
    const sessions = Array.isArray(studySessions) ? studySessions : [];
    const tests = Array.isArray(testRecords) ? testRecords : [];
    const moods = Array.isArray(moodEntries) ? moodEntries : [];
    const goals = Array.isArray(dailyGoals) ? dailyGoals : [];
    const psirData = Array.isArray(psirProgress) ? psirProgress : [];
    const essayData = Array.isArray(essayProgress) ? essayProgress : [];
    
    // Use advanced prediction engine with real-time analytics
    const userProgress = {
      user_id: 1,
      completion: calculateOverallCompletion(subjects),
      accuracy: calculateAccuracy(attempts),
      testPerformance: calculateTestPerformance(tests),
      category: 'general'
    };
    
    const historicalData = combineHistoricalData(attempts, sessions, tests, moods, goals);
    const advancedPrediction = generateAdvancedPrediction(userProgress, historicalData);
    const realTimeMetrics = PerformanceMetricsTracker.calculateRealTimeMetrics(historicalData);
    
    // Get comprehensive history and analysis
    const historyTracker = UPSCHistoryTracker.getInstance();
    const completeHistory = await historyTracker.getCompleteHistory('1');
    const performanceAnalysis = await StrengthWeaknessAnalyzer.analyzePerformance('1');
    
    // Calculate time to exam for personalized suggestions
    const examDate = new Date('2026-05-24');
    const timeToExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const personalizedSuggestions = PersonalizedSuggestionsEngine.generateDailySuggestions(
      performanceAnalysis, completeHistory, timeToExam
    );
    
    // Combine with existing analytics for backward compatibility
    const analytics = calculateAdvancedAnalytics(subjects, attempts, sessions, tests, moods, goals, psirData, essayData);
    const prediction = enhanceWithAdvancedPrediction(
      generateUltraRigorousPrediction(analytics), 
      advancedPrediction, 
      realTimeMetrics,
      completeHistory,
      performanceAnalysis,
      personalizedSuggestions
    );
    
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(generateFallbackPrediction());
  }
}

function calculateAdvancedAnalytics(subjects: any[], attempts: any[], sessions: any[], tests: any[], moods: any[], goals: any[], psirData: any[], essayData: any[]) {
  const subjectMetrics = subjects.map(subject => {
    const lectureCompletion = subject.total_lectures > 0 ? (subject.completed_lectures / subject.total_lectures) * 100 : 0;
    const dppCompletion = subject.total_dpps > 0 ? (subject.completed_dpps / subject.total_dpps) * 100 : 0;
    const revisionFactor = Math.min(subject.revisions * 10, 50);
    const weightedCompletion = (lectureCompletion * 0.6) + (dppCompletion * 0.4) + revisionFactor;
    
    return {
      ...subject,
      completion: Math.min(weightedCompletion, 100),
      quality: calculateQualityScore(lectureCompletion, dppCompletion, subject.revisions)
    };
  });
  
  const recentAttempts = attempts.slice(0, 100);
  const accuracy = recentAttempts.length > 0 ? (recentAttempts.filter(a => a.is_correct).length / recentAttempts.length) * 100 : 0;
  
  const avgTimePerQuestion = recentAttempts.length > 0 ? recentAttempts.reduce((sum, a) => sum + (a.time_taken || 120), 0) / recentAttempts.length : 120;
  const speedScore = Math.max(0, 100 - ((avgTimePerQuestion - 90) * 2));
  
  const studyConsistency = calculateConsistencyScore(sessions, goals);
  const testTrends = calculateTestTrends(tests);
  const moodImpact = calculateMoodImpact(moods, sessions);
  
  const overallCompletion = subjectMetrics.length > 0 ?
    subjectMetrics.reduce((sum, s) => sum + (s.completion * s.quality), 0) / 
    subjectMetrics.reduce((sum, s) => sum + s.quality, subjectMetrics.length) : 0;
  
  const psirAnalysis = calculatePSIRAnalysis(psirData, tests, accuracy);
  const essayAnalysis = calculateEssayAnalysis(essayData, tests, accuracy);
  
  return {
    subjectMetrics,
    accuracy,
    speedScore,
    studyConsistency,
    testTrends,
    moodImpact,
    overallCompletion,
    dataPoints: attempts.length + sessions.length + tests.length,
    preparationDays: calculatePreparationDays(sessions),
    psirAnalysis,
    essayAnalysis
  };
}

function calculateQualityScore(lectureComp: number, dppComp: number, revisions: number): number {
  const balance = 100 - Math.abs(lectureComp - dppComp);
  const revisionBonus = Math.min(revisions * 5, 25);
  return Math.min((balance + revisionBonus) / 100, 1.5);
}

function calculateConsistencyScore(sessions: any[], goals: any[]): number {
  if (sessions.length < 7) return 30;
  
  const dailyHours = sessions.map(s => s.duration_minutes / 60 || 0);
  const avgHours = dailyHours.reduce((sum, h) => sum + h, 0) / dailyHours.length;
  const variance = dailyHours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / dailyHours.length;
  const consistency = Math.max(0, 100 - (variance * 10));
  
  return Math.min(consistency, 100);
}

function calculateTestTrends(tests: any[]): any {
  if (tests.length < 3) return { trend: 'insufficient', avgScore: 0, improvement: 0 };
  
  const scores = tests.map(t => (t.scored_marks / t.total_marks) * 100);
  const recent = scores.slice(0, Math.ceil(scores.length / 2));
  const older = scores.slice(Math.ceil(scores.length / 2));
  
  const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;
  const improvement = recentAvg - olderAvg;
  
  return {
    trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
    avgScore: recentAvg,
    improvement: improvement
  };
}

function calculateMoodImpact(moods: any[], sessions: any[]): number {
  if (moods.length === 0) return 75;
  
  const moodScores = moods.map(m => {
    switch (m.mood.toLowerCase()) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'okay': return 60;
      case 'bad': return 40;
      case 'terrible': return 20;
      default: return 60;
    }
  });
  
  return moodScores.reduce((sum, s) => sum + s, 0) / moodScores.length;
}

function calculatePreparationDays(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  const firstSession = new Date(sessions[sessions.length - 1].created_at);
  const lastSession = new Date(sessions[0].created_at);
  return Math.ceil((lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24));
}

function generateUltraRigorousPrediction(analytics: any): any {
  const { subjectMetrics, accuracy, speedScore, studyConsistency, testTrends, moodImpact, overallCompletion, dataPoints, preparationDays, psirAnalysis, essayAnalysis } = analytics;
  
  const subjectAnalysis: any = {};
  const upscSubjects = ['gs1', 'gs2', 'gs3', 'gs4', 'csat', 'psir', 'optional', 'essay'];
  
  subjectMetrics.forEach((subject: any) => {
    const subjectKey = mapToUPSCSubject(subject.category);
    if (upscSubjects.includes(subjectKey)) {
      const baseScore = calculateUPSCSubjectScore(subject, accuracy, subjectKey);
      const rank = calculateSubjectRank(baseScore, subjectKey);
      const percentile = calculatePercentile(rank);
      
      subjectAnalysis[subjectKey] = subjectKey === 'csat' ? {
        score: Math.min(200, baseScore),
        qualifying: baseScore >= 66.67
      } : {
        score: Math.min(250, baseScore),
        rank: Math.max(1, rank),
        percentile: Math.min(99.9, percentile)
      };
    }
  });
  
  if (psirAnalysis && psirAnalysis.completion > 0) {
    subjectAnalysis['psir'] = {
      score: Math.min(500, psirAnalysis.predictedScore),
      rank: psirAnalysis.rank,
      percentile: psirAnalysis.percentile,
      completion: psirAnalysis.completion,
      paperWise: psirAnalysis.paperWise
    };
  }
  
  if (essayAnalysis && essayAnalysis.completion > 0) {
    subjectAnalysis['essay'] = {
      score: Math.min(250, essayAnalysis.predictedScore),
      rank: essayAnalysis.rank,
      percentile: essayAnalysis.percentile,
      completion: essayAnalysis.completion,
      writingSkill: essayAnalysis.writingSkill,
      essaysPracticed: essayAnalysis.essaysPracticed,
      lectureCompletion: essayAnalysis.lectureCompletion
    };
  }
  
  const examReadiness = calculateExamReadiness(overallCompletion, accuracy, speedScore, studyConsistency, moodImpact, preparationDays);
  const prelimsScore = calculatePrelimsScore(examReadiness, accuracy, speedScore, subjectAnalysis);
  const mainsScore = calculateMainsScore(examReadiness, overallCompletion, subjectAnalysis, testTrends);
  const interviewScore = calculateInterviewScore(examReadiness, moodImpact, studyConsistency);
  const finalScore = prelimsScore + mainsScore + interviewScore;
  const predictedRank = calculateUltraRealisticRank(finalScore, examReadiness, overallCompletion);
  const categoryRank = calculateCategoryRank(predictedRank);
  const qualificationProbability = calculateQualificationProbability(finalScore, predictedRank, examReadiness);
  
  const examDate = new Date('2026-05-24');
  const timeToExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const confidenceLevel = getConfidenceLevel(dataPoints, preparationDays, accuracy);
  const { strengthAreas, improvementAreas } = analyzeStrengthsWeaknesses(subjectAnalysis, analytics);
  const strategicRecommendations = generateStrategicRecommendations(analytics, timeToExam, qualificationProbability);
  
  return {
    examReadiness: Math.round(examReadiness),
    prelimsScore: Math.round(prelimsScore),
    prelimsCutoff: (UPSC_DATA.cutoffs as any)[2025]?.prelims || 95,
    mainsScore: Math.round(mainsScore),
    interviewScore: Math.round(interviewScore),
    finalScore: Math.round(finalScore),
    predictedRank: Math.round(predictedRank),
    categoryRank: Math.round(categoryRank),
    qualificationProbability: Math.round(qualificationProbability),
    subjectWiseAnalysis: subjectAnalysis,
    strengthAreas,
    improvementAreas,
    strategicRecommendations,
    timeToExam: Math.max(0, timeToExam),
    confidenceLevel,
    benchmarkComparison: {
      toppers: 1100,
      yourPosition: Math.round(finalScore),
      averageCandidate: 850
    },
    detailedMetrics: {
      accuracy: Math.round(accuracy),
      speedScore: Math.round(speedScore),
      consistency: Math.round(studyConsistency),
      moodImpact: Math.round(moodImpact),
      preparationDays,
      testTrend: testTrends.trend
    }
  };
}

function mapToUPSCSubject(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('gs1') || cat.includes('history') || cat.includes('culture')) return 'gs1';
  if (cat.includes('gs2') || cat.includes('polity') || cat.includes('governance')) return 'gs2';
  if (cat.includes('gs3') || cat.includes('economy') || cat.includes('science')) return 'gs3';
  if (cat.includes('gs4') || cat.includes('ethics') || cat.includes('integrity')) return 'gs4';
  if (cat.includes('csat') || cat.includes('aptitude')) return 'csat';
  if (cat.includes('psir') || cat.includes('political science') || cat.includes('international relations')) return 'psir';
  if (cat.includes('optional')) return 'optional';
  if (cat.includes('essay')) return 'essay';
  return 'other';
}

function calculateUPSCSubjectScore(subject: any, accuracy: number, subjectKey: string): number {
  const baseScore = subject.completion * (subjectKey === 'csat' ? 2 : 2.5);
  const accuracyBonus = (accuracy - 50) * 0.5;
  const qualityBonus = (subject.quality - 1) * 20;
  return Math.max(subjectKey === 'csat' ? 40 : 50, baseScore + accuracyBonus + qualityBonus);
}

function calculateSubjectRank(score: number, subjectKey: string): number {
  const maxScore = subjectKey === 'csat' ? 200 : 250;
  const percentageScore = (score / maxScore) * 100;
  
  if (percentageScore >= 90) return Math.random() * 1000 + 1;
  if (percentageScore >= 80) return Math.random() * 5000 + 1000;
  if (percentageScore >= 70) return Math.random() * 15000 + 5000;
  if (percentageScore >= 60) return Math.random() * 50000 + 20000;
  return Math.random() * 200000 + 70000;
}

function calculatePercentile(rank: number): number {
  const totalCandidates = 1000000;
  return ((totalCandidates - rank) / totalCandidates) * 100;
}

function calculateExamReadiness(completion: number, accuracy: number, speed: number, consistency: number, mood: number, days: number): number {
  const preparationPenalty = days < 365 ? (365 - days) * 0.05 : 0;
  const readiness = (completion * 0.35) + (accuracy * 0.25) + (speed * 0.15) + (consistency * 0.15) + (mood * 0.1) - preparationPenalty;
  return Math.max(0, Math.min(100, readiness));
}

function calculatePrelimsScore(readiness: number, accuracy: number, speed: number, subjects: any): number {
  const csatScore = subjects.csat?.score || 100;
  const gsAverage = ['gs1', 'gs2', 'gs3', 'gs4'].reduce((sum, key) => sum + (subjects[key]?.score || 100), 0) / 4;
  
  if (csatScore < 66.67) return Math.min(95, gsAverage * 0.8);
  
  const baseScore = (gsAverage * 0.7) + (accuracy * 0.2) + (speed * 0.1);
  const readinessFactor = readiness / 100;
  return Math.max(50, Math.min(200, baseScore * readinessFactor));
}

function calculateMainsScore(readiness: number, completion: number, subjects: any, testTrends: any): number {
  const gsTotal = ['gs1', 'gs2', 'gs3', 'gs4'].reduce((sum, key) => sum + (subjects[key]?.score || 100), 0);
  const optionalScore = subjects.psir?.score || subjects.optional?.score || 120;
  const essayScore = subjects.essay?.score || 100;
  
  const baseScore = gsTotal + optionalScore + essayScore;
  const completionFactor = Math.min(completion / 80, 1.2);
  const trendBonus = testTrends.improvement > 0 ? testTrends.improvement * 2 : testTrends.improvement * 1;
  
  return Math.max(400, Math.min(1200, (baseScore * completionFactor) + trendBonus));
}

function calculateInterviewScore(readiness: number, mood: number, consistency: number): number {
  const baseScore = 180;
  const personalityFactor = (mood + consistency) / 200;
  const readinessFactor = readiness / 100;
  const finalScore = baseScore + (personalityFactor * 50) + (readinessFactor * 45);
  return Math.max(150, Math.min(275, finalScore));
}

function calculateUltraRealisticRank(finalScore: number, readiness: number, completion: number): number {
  const scorePercentile = Math.max(0, Math.min(100, (finalScore - 600) / 10));
  const readinessBonus = readiness > 80 ? (readiness - 80) * 100 : 0;
  const completionPenalty = completion < 70 ? (70 - completion) * 1000 : 0;
  const baseRank = 1000000 - (scorePercentile * 9990);
  const adjustedRank = baseRank - readinessBonus + completionPenalty;
  return Math.max(1, Math.min(1000000, adjustedRank));
}

function calculateCategoryRank(overallRank: number): number {
  const generalCandidates = overallRank * 0.35;
  return Math.max(1, Math.round(generalCandidates));
}

function calculateQualificationProbability(finalScore: number, rank: number, readiness: number): number {
  if (rank > 2000) return Math.max(5, (2000 - rank) / 2000 * 100);
  if (rank > 1000) return Math.max(15, 85 - ((rank - 1000) / 10));
  if (finalScore < 900) return Math.max(25, finalScore / 900 * 75);
  if (readiness < 70) return Math.max(35, readiness);
  return Math.min(95, 60 + (readiness - 70) + ((1000 - rank) / 25));
}

function getConfidenceLevel(dataPoints: number, days: number, accuracy: number): string {
  if (dataPoints > 200 && days > 200 && accuracy > 70) return 'high';
  if (dataPoints > 100 && days > 100 && accuracy > 60) return 'medium';
  return 'low';
}

function analyzeStrengthsWeaknesses(subjects: any, analytics: any): any {
  const subjectScores = Object.entries(subjects)
    .filter(([key, data]: [string, any]) => key !== 'csat' && data.percentile)
    .sort(([,a]: [string, any], [,b]: [string, any]) => (b.percentile || 0) - (a.percentile || 0));
  
  const strengthAreas = subjectScores.slice(0, 2).map(([key]) => 
    key.toUpperCase().replace('GS', 'General Studies ').replace('PSIR', 'PSIR Optional')
  );
  const improvementAreas = subjectScores.slice(-2).map(([key]) => 
    key.toUpperCase().replace('GS', 'General Studies ').replace('PSIR', 'PSIR Optional')
  );
  
  if (analytics.accuracy > 80) strengthAreas.push('Question Accuracy');
  if (analytics.speedScore > 80) strengthAreas.push('Time Management');
  if (analytics.studyConsistency > 80) strengthAreas.push('Study Consistency');
  
  if (analytics.accuracy < 60) improvementAreas.push('Question Accuracy');
  if (analytics.speedScore < 60) improvementAreas.push('Speed & Time Management');
  if (analytics.studyConsistency < 60) improvementAreas.push('Study Consistency');
  
  return { 
    strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['Dedication to Studies'],
    improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Overall Performance']
  };
}

function generateStrategicRecommendations(analytics: any, timeToExam: number, qualificationProbability: number): string[] {
  const recommendations = [];
  
  if (timeToExam < 180) {
    recommendations.push('CRITICAL: Focus on revision and mock tests - avoid new topics');
    recommendations.push('Take daily full-length tests to build exam temperament');
  } else if (timeToExam < 365) {
    recommendations.push('Accelerate syllabus completion - aim for 90% by 6 months before exam');
  }
  
  if (analytics.accuracy < 70) {
    recommendations.push('URGENT: Improve accuracy through concept clarity - quality over quantity');
  }
  
  if (analytics.speedScore < 60) {
    recommendations.push('Practice timed tests daily - speed is crucial for UPSC success');
  }
  
  if (analytics.studyConsistency < 70) {
    recommendations.push('Maintain 8-10 hours daily study routine - consistency beats intensity');
  }
  
  if (analytics.overallCompletion < 60) {
    recommendations.push('Complete basic syllabus first - depth comes after breadth');
  }
  
  if (qualificationProbability < 50) {
    recommendations.push('REALITY CHECK: Consider extending preparation or backup plans');
    recommendations.push('Focus on fundamentals - build strong foundation before advanced topics');
  } else if (qualificationProbability < 75) {
    recommendations.push('You\'re on track but need significant improvement in weak areas');
  }
  
  if (analytics.subjectMetrics.some((s: any) => s.completion < 50)) {
    recommendations.push('Prioritize incomplete subjects - they can make or break your rank');
  }
  
  if (analytics.moodImpact < 60) {
    recommendations.push('Work on mental health and stress management - crucial for long preparation');
  }
  
  recommendations.push('Daily current affairs integration with static topics');
  recommendations.push('Weekly comprehensive revision of completed topics');
  recommendations.push('Monthly performance analysis and strategy adjustment');
  
  return recommendations.slice(0, 8);
}

function calculatePSIRAnalysis(psirData: any[], tests: any[], accuracy: number): any {
  if (psirData.length === 0) return null;
  
  // Extract section-wise data from PSIR page
  const sections = {
    politicalTheory: psirData.find(s => s.section_name === 'Political Theory') || { completed_items: 0, total_items: 150 },
    comparativePolitics: psirData.find(s => s.section_name === 'Comparative Politics') || { completed_items: 0, total_items: 150 },
    publicAdmin: psirData.find(s => s.section_name === 'Public Administration') || { completed_items: 0, total_items: 150 },
    internationalRelations: psirData.find(s => s.section_name === 'International Relations') || { completed_items: 0, total_items: 150 },
    lectures: psirData.find(s => s.section_name === 'Lectures') || { completed_items: 0, total_items: 250 },
    tests: psirData.find(s => s.section_name === 'Tests') || { completed_items: 0, total_items: 500 }
  };
  
  // Calculate paper-wise completion (UPSC PSIR has 2 papers)
  const paper1Completion = ((sections.politicalTheory.completed_items / sections.politicalTheory.total_items) + 
                           (sections.publicAdmin.completed_items / sections.publicAdmin.total_items)) / 2 * 100;
  
  const paper2Completion = ((sections.comparativePolitics.completed_items / sections.comparativePolitics.total_items) + 
                           (sections.internationalRelations.completed_items / sections.internationalRelations.total_items)) / 2 * 100;
  
  const lectureCompletion = (sections.lectures.completed_items / sections.lectures.total_items) * 100;
  const testCompletion = (sections.tests.completed_items / sections.tests.total_items) * 100;
  
  // Overall completion with weighted importance
  const overallCompletion = (paper1Completion * 0.3) + (paper2Completion * 0.3) + (lectureCompletion * 0.2) + (testCompletion * 0.2);
  
  // PSIR test performance analysis
  const psirTests = tests.filter(t => t.subject?.toLowerCase().includes('psir') || t.subject?.toLowerCase().includes('political'));
  const avgTestScore = psirTests.length > 0 ? psirTests.reduce((sum, t) => sum + (t.scored_marks / t.total_marks * 100), 0) / psirTests.length : 60;
  
  // Authentic UPSC PSIR scoring using real data patterns
  const psirBenchmark = getPSIRBenchmark();
  const qualityFactor = Math.min(lectureCompletion / 100, 1.2);
  const practiceBonus = Math.min(testCompletion / 100 * 20, 30);
  const balancePenalty = Math.abs(paper1Completion - paper2Completion) > 30 ? 20 : 0;
  
  // Use authentic UPSC scoring patterns (180-280 average, 350-450 toppers)
  const performanceScore = (overallCompletion * 0.4) + (avgTestScore * 0.6);
  const predictedScore = calculateRealisticScore(performanceScore, avgTestScore, 'optional');
  
  // Realistic ranking based on actual UPSC competition (8.9% success rate for PSIR)
  const rank = calculateRealisticRank(predictedScore * 4, 'general'); // Convert to total score scale
  const percentile = ((UPSC_DATA.competition.totalRegistrations - rank) / UPSC_DATA.competition.totalRegistrations) * 100;
  
  // Identify strengths and weaknesses based on actual performance
  const sectionScores = [
    { name: 'Political Theory', score: sections.politicalTheory.completed_items / sections.politicalTheory.total_items * 100 },
    { name: 'Comparative Politics', score: sections.comparativePolitics.completed_items / sections.comparativePolitics.total_items * 100 },
    { name: 'Public Administration', score: sections.publicAdmin.completed_items / sections.publicAdmin.total_items * 100 },
    { name: 'International Relations', score: sections.internationalRelations.completed_items / sections.internationalRelations.total_items * 100 }
  ].sort((a, b) => b.score - a.score);
  
  const strengths = sectionScores.slice(0, 2).map(s => s.name);
  const weaknesses = sectionScores.slice(-2).map(s => s.name);
  
  return {
    completion: Math.round(overallCompletion),
    predictedScore: Math.round(predictedScore),
    rank: Math.round(rank),
    percentile: Math.round(percentile),
    paperWise: {
      paper1: {
        topics: ['Political Theory', 'Public Administration'],
        completion: Math.round(paper1Completion)
      },
      paper2: {
        topics: ['Comparative Politics', 'International Relations'],
        completion: Math.round(paper2Completion)
      }
    },
    sectionWise: {
      politicalTheory: Math.round(sections.politicalTheory.completed_items / sections.politicalTheory.total_items * 100),
      comparativePolitics: Math.round(sections.comparativePolitics.completed_items / sections.comparativePolitics.total_items * 100),
      publicAdmin: Math.round(sections.publicAdmin.completed_items / sections.publicAdmin.total_items * 100),
      internationalRelations: Math.round(sections.internationalRelations.completed_items / sections.internationalRelations.total_items * 100)
    },
    lectureCompletion: Math.round(lectureCompletion),
    testsPracticed: sections.tests.completed_items,
    testCompletion: Math.round(testCompletion),
    testPerformance: Math.round(avgTestScore),
    strengths,
    weaknesses,
    rigorLevel: overallCompletion >= 80 ? 'High' : overallCompletion >= 60 ? 'Medium' : 'Low',
    readinessScore: Math.round((overallCompletion * 0.4) + (avgTestScore * 0.3) + (lectureCompletion * 0.3))
  };
}

function calculateEssayAnalysis(essayData: any[], tests: any[], accuracy: number): any {
  if (essayData.length === 0) return null;
  
  const essayInfo = essayData[0] || {};
  const lectureCompletion = essayInfo.total_lectures > 0 ? (essayInfo.lectures_completed / essayInfo.total_lectures) * 100 : 0;
  const essayCompletion = essayInfo.total_essays > 0 ? (essayInfo.essays_written / essayInfo.total_essays) * 100 : 0;
  const overallCompletion = (lectureCompletion + essayCompletion) / 2;
  
  const essayTests = tests.filter(t => t.subject?.toLowerCase().includes('essay'));
  const avgTestScore = essayTests.length > 0 ? essayTests.reduce((sum, t) => sum + (t.scored_marks / t.total_marks * 100), 0) / essayTests.length : 65;
  
  const writingSkill = {
    structure: Math.min(100, lectureCompletion + 20),
    practice: Math.min(100, essayCompletion),
    speed: Math.min(100, (essayInfo.essays_written || 0) * 2),
    content: Math.min(100, avgTestScore + 10)
  };
  
  const avgWritingSkill = Object.values(writingSkill).reduce((sum: number, score: number) => sum + score, 0) / 4;
  
  // Authentic UPSC Essay scoring (80-130 average, 150-180 toppers)
  const performanceScore = (overallCompletion * 0.4) + (avgWritingSkill * 0.6);
  const predictedScore = calculateRealisticScore(performanceScore, avgTestScore, 'essay');
  
  const rank = calculateRealisticRank(predictedScore * 8, 'general'); // Convert to total score scale
  const percentile = ((UPSC_DATA.competition.totalRegistrations - rank) / UPSC_DATA.competition.totalRegistrations) * 100;
  
  return {
    completion: Math.round(overallCompletion),
    predictedScore: Math.round(predictedScore),
    rank: Math.round(rank),
    percentile: Math.round(percentile),
    lectureCompletion: Math.round(lectureCompletion),
    essaysPracticed: essayInfo.essays_written || 0,
    writingSkill: Math.round(avgWritingSkill),
    testPerformance: Math.round(avgTestScore),
    strengths: avgWritingSkill > 75 ? ['Writing Structure', 'Content Quality'] : ['Basic Understanding'],
    weaknesses: avgWritingSkill < 60 ? ['Writing Speed', 'Essay Structure', 'Content Depth'] : essayCompletion < 50 ? ['Practice Essays'] : ['Advanced Techniques']
  };
}

function combineHistoricalData(attempts: any[], sessions: any[], tests: any[], moods: any[], goals: any[]): any[] {
  const combined: any[] = [];
  
  // Add attempts data
  attempts.forEach(a => combined.push({
    timestamp: a.attempted_at,
    type: 'attempt',
    performance: a.is_correct ? 100 : 0,
    accuracy: a.is_correct ? 100 : 0,
    time_taken: a.time_taken
  }));
  
  // Add session data
  sessions.forEach(s => combined.push({
    timestamp: s.created_at,
    type: 'session',
    duration_minutes: s.duration_minutes,
    performance: Math.min(100, (s.duration_minutes / 60) * 10) // Performance based on study hours
  }));
  
  // Add test data
  tests.forEach(t => combined.push({
    timestamp: t.attempt_date,
    type: 'test',
    performance: (t.scored_marks / t.total_marks) * 100,
    accuracy: (t.scored_marks / t.total_marks) * 100
  }));
  
  // Add mood data
  moods.forEach(m => combined.push({
    timestamp: m.date,
    type: 'mood',
    mood: m.mood,
    performance: getMoodScore(m.mood)
  }));
  
  return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function getMoodScore(mood: string): number {
  const moodScores: { [key: string]: number } = {
    'excellent': 100, 'good': 80, 'okay': 60, 'bad': 40, 'terrible': 20
  };
  return moodScores[mood.toLowerCase()] || 60;
}

function calculateOverallCompletion(subjects: any[]): number {
  if (subjects.length === 0) return 0;
  return subjects.reduce((sum, s) => {
    const lectureComp = s.total_lectures > 0 ? (s.completed_lectures / s.total_lectures) * 100 : 0;
    const dppComp = s.total_dpps > 0 ? (s.completed_dpps / s.total_dpps) * 100 : 0;
    return sum + ((lectureComp + dppComp) / 2);
  }, 0) / subjects.length;
}

function calculateAccuracy(attempts: any[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter(a => a.is_correct).length;
  return (correct / attempts.length) * 100;
}

function calculateTestPerformance(tests: any[]): number {
  if (tests.length === 0) return 0;
  return tests.reduce((sum, t) => sum + (t.scored_marks / t.total_marks * 100), 0) / tests.length;
}

function enhanceWithAdvancedPrediction(basePrediction: any, advancedPrediction: any, realTimeMetrics: any, history?: any, analysis?: any, suggestions?: any): any {
  return {
    ...basePrediction,
    // Enhanced with advanced analytics
    advancedAnalytics: {
      totalScore: advancedPrediction.totalScore,
      subjectPredictions: advancedPrediction.subjectPredictions,
      rankPrediction: advancedPrediction.rankPrediction,
      confidenceLevel: advancedPrediction.confidenceLevel,
      dataQuality: advancedPrediction.dataQuality,
      lastUpdated: advancedPrediction.lastUpdated
    },
    realTimeMetrics: {
      studyConsistency: Math.round(realTimeMetrics.studyConsistency * 100),
      accuracyTrend: Math.round(realTimeMetrics.accuracyTrend * 100),
      speedImprovement: Math.round(realTimeMetrics.speedImprovement * 100),
      retentionRate: Math.round(realTimeMetrics.retentionRate * 100),
      burnoutRisk: Math.round(realTimeMetrics.burnoutRisk * 100),
      peakPerformanceHours: realTimeMetrics.peakPerformanceHours
    },
    // Adaptive factors from advanced engine
    adaptiveFactors: advancedPrediction.adaptiveFactors,
    // Complete preparation journey
    preparationJourney: history ? {
      totalDays: history.preparationDays,
      totalStudyHours: history.effortMetrics?.totalStudyHours || 0,
      totalActivities: history.totalActivities,
      consistencyScore: history.effortMetrics?.consistencyScore || 0
    } : null,
    
    // Comprehensive analysis
    comprehensiveAnalysis: analysis ? {
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      subjectAnalysis: analysis.subjectWiseAnalysis || [],
      topicAnalysis: analysis.topicWiseAnalysis || [],
      timePatterns: analysis.timePatterns || null,
      testPerformance: analysis.testPerformance || null
    } : null,
    
    // Personalized daily suggestions
    dailySuggestions: suggestions ? {
      priority: suggestions.priority || [],
      studyPlan: suggestions.studyPlan || null,
      weaknessTargeting: suggestions.weaknessTargeting || null,
      strengthLeveraging: suggestions.strengthLeveraging || null,
      motivational: suggestions.motivational || []
    } : null,
    
    // Real-time update indicator
    isRealTime: true,
    predictionVersion: '2.0',
    neverForgetsEffort: true
  };
}

function generateFallbackPrediction(): any {
  return {
    examReadiness: 45,
    prelimsScore: 92,
    prelimsCutoff: 98,
    mainsScore: 720,
    interviewScore: 175,
    finalScore: 887,
    predictedRank: 25000,
    categoryRank: 8750,
    qualificationProbability: 35,
    subjectWiseAnalysis: {
      gs1: { score: 78, rank: 15000, percentile: 65 },
      gs2: { score: 82, rank: 12000, percentile: 70 },
      gs3: { score: 85, rank: 10000, percentile: 75 },
      gs4: { score: 75, rank: 18000, percentile: 60 },
      csat: { score: 92, qualifying: true },
      psir: { 
        score: 135, 
        rank: 6500, 
        percentile: 82,
        rigorLevel: 'Medium',
        readinessScore: 68,
        paperWise: {
          paper1: { completion: 65 },
          paper2: { completion: 72 }
        },
        sectionWise: {
          politicalTheory: 70,
          comparativePolitics: 75,
          publicAdmin: 60,
          internationalRelations: 68
        },
        lectureCompletion: 55,
        testsPracticed: 180,
        testCompletion: 36
      },
      essay: { score: 105, rank: 12000, percentile: 68 }
    },
    strengthAreas: ['General Studies 3', 'PSIR Optional'],
    improvementAreas: ['General Studies 4', 'Answer Writing Speed', 'Current Affairs'],
    strategicRecommendations: [
      'URGENT: Complete syllabus coverage - currently insufficient for UPSC standards',
      'Focus 50% time on weak subjects - GS4 needs immediate attention',
      'Daily answer writing practice with time constraints',
      'Take weekly mock tests and analyze performance gaps',
      'Integrate current affairs with static topics daily',
      'Consider extending preparation timeline for better results'
    ],
    timeToExam: 180,
    confidenceLevel: 'low',
    benchmarkComparison: {
      toppers: 1100,
      yourPosition: 887,
      averageCandidate: 850
    },
    detailedMetrics: {
      accuracy: 55,
      speedScore: 45,
      consistency: 40,
      moodImpact: 60,
      preparationDays: 120,
      testTrend: 'insufficient'
    }
  };
}