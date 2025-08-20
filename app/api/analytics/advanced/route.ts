import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { groq } from '@/lib/groq';

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
      performancePrediction: await getAIPerformancePrediction(subjectsArray, goalsArray, testsArray),
      weakAreas: await getAIWeakAreas(subjectsArray, testsArray),
      studyPatterns: analyzeStudyPatterns(goalsArray),
      timeAllocation: await getAITimeAllocation(subjectsArray, goalsArray),
      achievements: generateAchievements(subjectsArray, goalsArray),
      reminders: await getAIReminders(subjectsArray, goalsArray)
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

async function getAIPerformancePrediction(subjects: any[], goals: any[], tests: any[]) {
  try {
    const prompt = `Analyze UPSC preparation data and predict performance:

Subjects Progress: ${JSON.stringify(subjects.map(s => ({
      subject: s.subject,
      lectureProgress: Math.round((s.completed_lectures / s.total_lectures) * 100),
      dppProgress: Math.round((s.completed_dpps / s.total_dpps) * 100)
    })))}

Recent Study Hours: ${goals.slice(0, 7).reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0)} hours in last 7 days

Test Scores: ${tests.map(t => Math.round((t.scored_marks / t.total_marks) * 100)).join(', ')}%

Predict UPSC exam performance score (0-100), trend (improving/stable/declining), and confidence (0-100). Respond in JSON format: {"score": number, "trend": string, "confidence": number, "reasoning": string}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      score: result.score || 0,
      trend: result.trend || 'stable',
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'AI analysis based on study patterns'
    };
  } catch (error) {
    return { score: 0, trend: 'stable', confidence: 0, reasoning: 'AI analysis unavailable' };
  }
}

async function getAIWeakAreas(subjects: any[], tests: any[]) {
  try {
    const prompt = `Identify weak areas in UPSC preparation:

Subjects: ${JSON.stringify(subjects.map(s => ({
      subject: s.subject,
      category: s.category,
      progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100)
    })))}

Identify top 3 weak areas that need immediate attention. Consider progress percentage and UPSC exam weightage. Respond in JSON format: [{"subject": string, "category": string, "progress": number, "priority": "high/medium/low", "reason": string}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return subjects.filter(s => ((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100 < 50).slice(0, 3);
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

async function getAITimeAllocation(subjects: any[], goals: any[]) {
  try {
    const prompt = `Recommend optimal time allocation for UPSC preparation:

Subjects: ${JSON.stringify(subjects.map(s => ({
      subject: s.subject,
      category: s.category,
      progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100)
    })))}

Total daily study time: 8 hours
Recent study pattern: ${goals.slice(0, 7).reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0)} hours in last 7 days

Recommend daily hours for each subject considering UPSC exam weightage and current progress. Respond in JSON format: [{"subject": string, "category": string, "recommendedHours": number, "reason": string}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return subjects.map(s => ({ subject: s.subject, category: s.category, recommendedHours: 1.5, reason: 'Standard allocation' }));
  }
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

async function getAIReminders(subjects: any[], goals: any[]) {
  try {
    const prompt = `Generate personalized study reminders for UPSC preparation:

Subjects Progress: ${JSON.stringify(subjects.map(s => ({
      subject: s.subject,
      progress: Math.round(((s.completed_lectures / s.total_lectures) + (s.completed_dpps / s.total_dpps)) / 2 * 100)
    })))}

Recent Study Activity: ${goals.slice(0, 3).map(g => `${g.date}: ${g.hours_studied}h`).join(', ')}

Generate 3-5 personalized study reminders considering progress gaps and UPSC exam timeline. Respond in JSON format: [{"type": string, "message": string, "priority": "high/medium/low"}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7
    });

    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch (error) {
    return [{ type: 'study', message: 'Continue your preparation consistently!', priority: 'medium' }];
  }
}