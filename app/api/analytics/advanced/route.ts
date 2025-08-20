import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [subjects] = await connection.execute(`SELECT * FROM subject_progress WHERE user_id = 1`);
    const [goals] = await connection.execute(`SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC LIMIT 30`);
    const [tests] = await connection.execute(`SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC LIMIT 20`);

    await connection.end();

    const subjectsArray = Array.isArray(subjects) ? subjects as any[] : [];
    const goalsArray = Array.isArray(goals) ? goals as any[] : [];
    const testsArray = Array.isArray(tests) ? tests as any[] : [];

    const analytics = {
      performancePrediction: calculatePerformancePrediction(subjectsArray, goalsArray, testsArray),
      weakAreas: identifyWeakAreas(subjectsArray, testsArray),
      studyPatterns: analyzeStudyPatterns(goalsArray),
      timeAllocation: recommendTimeAllocation(subjectsArray, goalsArray),
      achievements: generateAchievements(subjectsArray, goalsArray),
      reminders: generateReminders(subjectsArray, goalsArray)
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json({
      performancePrediction: { score: 0, trend: 'stable' },
      weakAreas: [],
      studyPatterns: { consistency: 0, peakHours: [] },
      timeAllocation: [],
      achievements: [],
      reminders: []
    }, { status: 200 });
  }
}

function calculatePerformancePrediction(subjects: any[], goals: any[], tests: any[]) {
  const totalProgress = subjects.reduce((sum, s) => {
    const lectureProgress = (s.completed_lectures / s.total_lectures) * 100;
    const dppProgress = (s.completed_dpps / s.total_dpps) * 100;
    return sum + (lectureProgress + dppProgress) / 2;
  }, 0) / subjects.length;

  const recentStudyHours = goals.slice(0, 7).reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0);
  const avgTestScore = tests.length > 0 ? tests.reduce((sum, t) => sum + (t.scored_marks / t.total_marks * 100), 0) / tests.length : 0;

  const predictedScore = (totalProgress * 0.4) + (recentStudyHours * 2) + (avgTestScore * 0.3);
  
  return {
    score: Math.min(Math.round(predictedScore), 100),
    trend: recentStudyHours > 20 ? 'improving' : recentStudyHours > 10 ? 'stable' : 'declining',
    confidence: Math.min(tests.length * 5 + goals.length, 100)
  };
}

function identifyWeakAreas(subjects: any[], tests: any[]) {
  return subjects
    .map(s => ({
      subject: s.subject,
      category: s.category,
      progress: ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100,
      priority: s.completed_lectures < s.total_lectures * 0.3 ? 'high' : 'medium'
    }))
    .filter(s => s.progress < 50)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5);
}

function analyzeStudyPatterns(goals: any[]) {
  const studyDays = goals.filter(g => parseFloat(g.hours_studied) > 0).length;
  const totalDays = Math.min(goals.length, 30);
  const consistency = totalDays > 0 ? (studyDays / totalDays) * 100 : 0;

  return {
    consistency: Math.round(consistency),
    avgDailyHours: goals.length > 0 ? goals.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0) / goals.length : 0
  };
}

function recommendTimeAllocation(subjects: any[], goals: any[]) {
  const totalStudyTime = 8;
  
  return subjects.map(s => {
    const progress = ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2;
    const weight = progress < 0.3 ? 1.5 : progress < 0.6 ? 1.2 : 1.0;
    const recommendedHours = (totalStudyTime / subjects.length) * weight;
    
    return {
      subject: s.subject,
      category: s.category,
      recommendedHours: Math.round(recommendedHours * 10) / 10,
      reason: progress < 0.3 ? 'Behind schedule' : progress < 0.6 ? 'Needs attention' : 'On track'
    };
  });
}

function generateAchievements(subjects: any[], goals: any[]) {
  const achievements = [];
  
  const recentDays = goals.slice(0, 7).filter(g => parseFloat(g.hours_studied) > 0).length;
  if (recentDays >= 7) achievements.push({ type: 'streak', message: '7-day study streak!', icon: '🔥' });
  
  subjects.forEach(s => {
    const lectureProgress = (s.completed_lectures / s.total_lectures) * 100;
    if (lectureProgress >= 100) {
      achievements.push({ type: 'completion', message: `${s.subject} lectures completed!`, icon: '🎉' });
    }
  });
  
  return achievements;
}

function generateReminders(subjects: any[], goals: any[]) {
  const reminders = [];
  const today = new Date();
  
  const todayActivity = goals.some(g => g.date === today.toISOString().split('T')[0]);
  if (!todayActivity) {
    reminders.push({
      type: 'study',
      message: 'Time to start your daily study session!',
      priority: 'high'
    });
  }
  
  subjects.forEach(s => {
    const progress = (s.completed_lectures / s.total_lectures) * 100;
    if (progress < 30) {
      reminders.push({
        type: 'subject',
        message: `${s.subject} needs attention - only ${Math.round(progress)}% complete`,
        priority: 'medium'
      });
    }
  });
  
  return reminders;
}