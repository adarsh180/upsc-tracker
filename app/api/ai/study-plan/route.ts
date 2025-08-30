import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { generateStudySuggestions } from '@/lib/ai-suggestions';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Get user's recent progress data
    const [subjectProgress] = await connection.execute(
      'SELECT * FROM subject_progress WHERE user_id = 1'
    );
    
    const [testRecords] = await connection.execute(
      'SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC LIMIT 10'
    );
    
    const [dailyGoals] = await connection.execute(
      'SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC LIMIT 30'
    );
    
    await connection.end();
    
    // Analyze data to identify patterns
    const subjects = Array.isArray(subjectProgress) ? subjectProgress : [];
    const tests = Array.isArray(testRecords) ? testRecords : [];
    const goals = Array.isArray(dailyGoals) ? dailyGoals : [];
    
    // Calculate weak areas
    const weakAreas = subjects
      .filter((s: any) => {
        const completion = (s.completed_lectures / s.total_lectures) * 100;
        return completion < 50;
      })
      .map((s: any) => s.subject);
    
    // Calculate study hours
    const totalHours = goals.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0);
    const avgDailyHours = totalHours / Math.max(goals.length, 1);
    
    // Generate AI suggestions based on real data
    const suggestions = await generateStudySuggestions({
      recentProgress: subjects,
      weakAreas,
      studyHours: avgDailyHours,
      examDate: '2026-05-24'
    });
    
    // Generate today's focus areas based on actual weak areas
    const todayFocus = [];
    if (weakAreas.length > 0) {
      todayFocus.push(...weakAreas.slice(0, 2));
    }
    // Add current affairs if not already included
    if (!todayFocus.includes('Current Affairs')) {
      todayFocus.push('Current Affairs');
    }
    // Fill remaining slots with subjects that need attention
    const needsAttention = subjects
      .filter((s: any) => {
        const completion = (s.completed_lectures / s.total_lectures) * 100;
        return completion < 80 && completion > 30;
      })
      .map((s: any) => s.subject)
      .slice(0, 3 - todayFocus.length);
    todayFocus.push(...needsAttention);
    
    // Generate realistic weekly goals based on current progress
    const weeklyGoals = [];
    const targetHours = Math.max(35, Math.ceil(avgDailyHours * 7));
    weeklyGoals.push(`Complete ${targetHours} hours of focused study`);
    
    const questionsTarget = Math.ceil(avgDailyHours * 40);
    weeklyGoals.push(`Solve ${questionsTarget} practice questions`);
    
    if (weakAreas.length > 0) {
      weeklyGoals.push(`Focus on improving ${weakAreas[0]}`);
    } else {
      weeklyGoals.push('Maintain current study momentum');
    }
    
    // Identify actual strengths from data
    const strengths = subjects
      .filter((s: any) => {
        const completion = (s.completed_lectures / s.total_lectures) * 100;
        return completion > 70;
      })
      .map((s: any) => s.subject)
      .slice(0, 4);
    
    const studyPlan = {
      todayFocus,
      weeklyGoals,
      suggestions: suggestions.slice(0, 4),
      riskAreas: weakAreas.slice(0, 4),
      strengths: strengths.length > 0 ? strengths : ['Consistent Study Habit', 'Good Progress Tracking']
    };
    
    return NextResponse.json(studyPlan);
    
  } catch (error) {
    console.error('Study plan generation error:', error);
    
    // Fallback response
    return NextResponse.json({
      todayFocus: ['Current Affairs - International Relations', 'GS2 - Governance', 'Optional Subject'],
      weeklyGoals: ['Complete 35 hours of study', 'Solve 300 practice questions', 'Revise weak areas'],
      suggestions: [
        {
          type: 'urgent',
          title: 'Focus on Current Affairs',
          description: 'Dedicate more time to daily current affairs reading and note-making.',
          action: 'Read newspaper + make notes',
          estimatedTime: '2 hours',
          priority: 1
        },
        {
          type: 'recommended',
          title: 'Strengthen Test Performance',
          description: 'Your test scores show room for improvement in time management.',
          action: 'Practice timed mock tests',
          estimatedTime: '3 hours',
          priority: 2
        }
      ],
      riskAreas: ['Current Affairs', 'Time Management'],
      strengths: ['Consistent Study Habit', 'Good Progress Tracking']
    });
  }
}