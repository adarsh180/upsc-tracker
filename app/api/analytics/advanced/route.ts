import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Fetch ALL existing data from database
    const [subjects] = await connection.execute(`SELECT * FROM subject_progress WHERE user_id = 1`);
    const [goals] = await connection.execute(`SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC`);
    const [tests] = await connection.execute(`SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC`);
    const [currentAffairs] = await connection.execute(`SELECT * FROM current_affairs WHERE user_id = 1`);
    const [essayProgress] = await connection.execute(`SELECT * FROM essay_progress WHERE user_id = 1`);
    const [optionalProgress] = await connection.execute(`SELECT * FROM optional_progress WHERE user_id = 1`);
    const [moodEntries] = await connection.execute(`SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC`);
    
    // Get comprehensive statistics
    const [totalStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT date) as total_study_days,
        SUM(hours_studied) as total_hours,
        SUM(topics_covered) as total_topics,
        AVG(hours_studied) as avg_daily_hours
      FROM daily_goals WHERE user_id = 1 AND hours_studied > 0
    `);
    
    const [subjectStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_subjects,
        SUM(completed_lectures) as total_completed_lectures,
        SUM(total_lectures) as total_lectures_available,
        SUM(completed_dpps) as total_completed_dpps,
        SUM(total_dpps) as total_dpps_available,
        SUM(revisions) as total_revisions
      FROM subject_progress WHERE user_id = 1
    `);
    
    const [testStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_tests,
        AVG(scored_marks/total_marks*100) as avg_score,
        MAX(scored_marks/total_marks*100) as best_score,
        MIN(scored_marks/total_marks*100) as lowest_score
      FROM test_records WHERE user_id = 1
    `);

    await connection.end();

    const subjectsArray = Array.isArray(subjects) ? subjects as any[] : [];
    const goalsArray = Array.isArray(goals) ? goals as any[] : [];
    const testsArray = Array.isArray(tests) ? tests as any[] : [];
    const currentAffairsArray = Array.isArray(currentAffairs) ? currentAffairs as any[] : [];
    const essayProgressArray = Array.isArray(essayProgress) ? essayProgress as any[] : [];
    const optionalProgressArray = Array.isArray(optionalProgress) ? optionalProgress as any[] : [];
    const moodEntriesArray = Array.isArray(moodEntries) ? moodEntries as any[] : [];
    const totalStatsArray = Array.isArray(totalStats) ? totalStats as any[] : [];
    const subjectStatsArray = Array.isArray(subjectStats) ? subjectStats as any[] : [];
    const testStatsArray = Array.isArray(testStats) ? testStats as any[] : [];

    // Compile ALL existing data for comprehensive analysis
    const comprehensiveData = {
      subjects: subjectsArray,
      goals: goalsArray,
      tests: testsArray,
      currentAffairs: currentAffairsArray,
      essay: essayProgressArray,
      optional: optionalProgressArray,
      mood: moodEntriesArray,
      totalStats: totalStatsArray[0] || {},
      subjectStats: subjectStatsArray[0] || {},
      testStats: testStatsArray[0] || {},
      
      // Calculate existing progress metrics
      overallProgress: {
        totalSubjects: subjectsArray.length,
        completedSubjects: subjectsArray.filter(s => (s.completed_lectures / s.total_lectures) >= 1).length,
        avgSubjectProgress: subjectsArray.length > 0 ? 
          subjectsArray.reduce((sum, s) => sum + ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100, 0) / subjectsArray.length : 0,
        
        totalStudyDays: totalStatsArray[0]?.total_study_days || 0,
        totalStudyHours: totalStatsArray[0]?.total_hours || 0,
        avgDailyHours: totalStatsArray[0]?.avg_daily_hours || 0,
        
        totalTests: testsArray.length,
        avgTestScore: testStatsArray[0]?.avg_score || 0,
        bestTestScore: testStatsArray[0]?.best_score || 0,
        
        currentAffairsProgress: currentAffairsArray.length > 0 ? 
          (currentAffairsArray[0].completed_topics / currentAffairsArray[0].total_topics) * 100 : 0,
        essayProgress: essayProgressArray.length > 0 ? 
          (essayProgressArray[0].essays_written / essayProgressArray[0].total_essays) * 100 : 0,
        optionalProgress: optionalProgressArray.length > 0 ? 
          optionalProgressArray.reduce((sum, o) => sum + (o.completed_items / o.total_items) * 100, 0) / optionalProgressArray.length : 0,
        
        studyStreak: calculateStudyStreak(goalsArray),
        moodTrend: calculateMoodTrend(moodEntriesArray)
      }
    };

    const analytics = {
      performancePrediction: await getAIPerformancePrediction(comprehensiveData),
      weakAreas: await getAIWeakAreas(comprehensiveData),
      studyPatterns: analyzeStudyPatterns(goalsArray),
      timeAllocation: await getAITimeAllocation(comprehensiveData),
      achievements: generateAchievements(comprehensiveData),
      reminders: await getAIReminders(comprehensiveData),
      realTimeData: generateRealTimeChartData(comprehensiveData),
      
      // Include ALL existing data for display
      existingData: {
        subjects: subjectsArray,
        totalGoals: goalsArray.length,
        totalTests: testsArray.length,
        currentAffairs: currentAffairsArray,
        essay: essayProgressArray,
        optional: optionalProgressArray,
        mood: moodEntriesArray.slice(0, 30),
        overallProgress: comprehensiveData.overallProgress,
        statistics: {
          total: totalStatsArray[0] || {},
          subjects: subjectStatsArray[0] || {},
          tests: testStatsArray[0] || {}
        }
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json({
      performancePrediction: { score: 0, trend: 'stable', confidence: 0, reasoning: 'No data available' },
      weakAreas: [],
      studyPatterns: { consistency: 0, avgDailyHours: 0 },
      timeAllocation: [],
      achievements: [],
      reminders: [],
      realTimeData: { trendData: [], subjectData: [] }
    }, { status: 200 });
  }
}

async function getAIPerformancePrediction(data: any) {
  try {
    const totalSubjects = data.subjects.length;
    const avgSubjectProgress = totalSubjects > 0 ? data.subjects.reduce((sum: number, s: any) => {
      const lectureProgress = s.total_lectures > 0 ? (s.completed_lectures / s.total_lectures) * 100 : 0;
      const dppProgress = s.total_dpps > 0 ? (s.completed_dpps / s.total_dpps) * 100 : 0;
      return sum + (lectureProgress + dppProgress) / 2;
    }, 0) / totalSubjects : 0;

    const totalStudyHours = data.goals.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0);
    const recentStudyHours = data.goals.slice(0, 7).reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0);
    const avgTestScore = data.tests.length > 0 ? data.tests.reduce((sum: number, t: any) => sum + (t.scored_marks / t.total_marks * 100), 0) / data.tests.length : 0;

    const prompt = `Analyze UPSC preparation and predict performance: Average Progress: ${Math.round(avgSubjectProgress)}%, Study Hours: ${Math.round(recentStudyHours)}h/week, Test Average: ${Math.round(avgTestScore)}%. Respond JSON: {"score": number, "trend": "improving/stable/declining", "confidence": number, "reasoning": "explanation", "recommendations": ["suggestions"]}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.2
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      score: result.score || Math.round(avgSubjectProgress),
      trend: result.trend || (recentStudyHours > 20 ? 'improving' : 'stable'),
      confidence: result.confidence || Math.min(data.tests.length * 10 + data.goals.length, 100),
      reasoning: result.reasoning || `Based on ${Math.round(avgSubjectProgress)}% progress`,
      recommendations: result.recommendations || ['Focus on weak subjects', 'Increase study hours']
    };
  } catch (error) {
    const fallbackScore = Math.round(
      (data.subjects.reduce((sum: number, s: any) => sum + ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100, 0) / Math.max(data.subjects.length, 1))
    );
    return { 
      score: Math.min(fallbackScore, 100), 
      trend: 'stable', 
      confidence: 75, 
      reasoning: 'Calculated based on current progress',
      recommendations: ['Continue consistent preparation']
    };
  }
}

async function getAIWeakAreas(data: any) {
  try {
    const subjectSummary = data.subjects.map((s: any) => ({
      subject: s.subject,
      progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100)
    }));

    const prompt = `Identify weak UPSC subjects: ${JSON.stringify(subjectSummary)}. Respond JSON: [{"subject": "name", "progress": number, "priority": "high/medium", "reason": "explanation"}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.3
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return data.subjects.filter((s: any) => ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100 < 50).slice(0, 5);
  }
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

async function getAITimeAllocation(data: any) {
  try {
    const subjectSummary = data.subjects.map((s: any) => ({
      subject: s.subject,
      progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100)
    }));

    const prompt = `Recommend UPSC study time allocation for: ${JSON.stringify(subjectSummary)}. Total: 8h/day. Respond JSON: [{"subject": "name", "recommendedHours": number, "reason": "explanation"}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.3
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return data.subjects.map((s: any) => ({ subject: s.subject, recommendedHours: 1.5, reason: 'Standard allocation' }));
  }
}

function generateAchievements(data: any) {
  const achievements = [];
  
  const recentDays = data.goals.slice(0, 7).filter((g: any) => parseFloat(g.hours_studied) > 0).length;
  if (recentDays >= 7) achievements.push({ type: 'streak', message: '7-day study streak!', icon: '🔥' });
  
  data.subjects.forEach((s: any) => {
    const lectureProgress = (s.completed_lectures / s.total_lectures) * 100;
    if (lectureProgress >= 100) {
      achievements.push({ type: 'completion', message: `${s.subject} lectures completed!`, icon: '🎉' });
    }
  });
  
  return achievements;
}

async function getAIReminders(data: any) {
  try {
    const recentActivity = data.goals.slice(0, 3).map((g: any) => `${g.date}: ${g.hours_studied}h`).join(', ');
    const prompt = `Generate UPSC study reminders based on: ${recentActivity}. Respond JSON: [{"type": "study", "message": "reminder text", "priority": "high/medium/low"}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return [{ type: 'study', message: 'Continue your preparation consistently!', priority: 'medium' }];
  }
}

function generateRealTimeChartData(data: any) {
  // Generate real trend data from ALL goals
  const monthlyData = data.goals.reduce((acc: any, goal: any) => {
    const date = new Date(goal.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthLabel, score: 0, hours: 0, topics: 0, sessions: 0 };
    }
    acc[monthKey].hours += parseFloat(goal.hours_studied || 0);
    acc[monthKey].topics += parseInt(goal.topics_covered || 0);
    acc[monthKey].sessions += 1;
    return acc;
  }, {});

  // Calculate performance score based on actual data
  const trendData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .map((m: any) => ({
      month: m.month,
      score: Math.min(Math.round((m.hours / m.sessions) * 10 + (m.topics / m.sessions) * 2), 100),
      hours: Math.round(m.hours),
      topics: Math.round(m.topics),
      sessions: m.sessions
    }))
    .slice(-6); // Last 6 months

  // Generate real subject data with actual progress
  const subjectData = data.subjects.map((s: any, index: number) => ({
    subject: s.subject,
    category: s.category,
    lectureProgress: Math.round((s.completed_lectures / s.total_lectures) * 100),
    dppProgress: Math.round((s.completed_dpps / s.total_dpps) * 100),
    progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100),
    revisions: s.revisions,
    color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5A2B', '#FF6B6B'][index % 8]
  }));

  return { trendData, subjectData };
}

function calculateStudyStreak(goals: any[]) {
  let streak = 0;
  const sortedGoals = goals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (let i = 0; i < sortedGoals.length; i++) {
    if (parseFloat(sortedGoals[i].hours_studied || 0) > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calculateMoodTrend(moodEntries: any[]) {
  if (moodEntries.length === 0) return 50;
  
  const recentMoods = moodEntries.slice(0, 7);
  const positiveMoods = recentMoods.filter(m => ['happy', 'motivated', 'confident', 'excited'].includes(m.mood?.toLowerCase()));
  
  return Math.round((positiveMoods.length / recentMoods.length) * 100);
}