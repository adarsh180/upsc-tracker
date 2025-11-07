import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Get user progress data
    const [userProgress] = await connection.execute(
      'SELECT * FROM user_progress WHERE user_id = 1'
    );
    
    // Get study hours from sessions
    const [studyHours] = await connection.execute(
      'SELECT COALESCE(SUM(duration_minutes), 0) / 60 as study_hours FROM study_sessions WHERE user_id = 1'
    );
    
    // Get tests completed
    const [testsCompleted] = await connection.execute(
      'SELECT COUNT(*) as tests_completed FROM test_records WHERE user_id = 1'
    );
    
    await connection.end();
    
    const progress = Array.isArray(userProgress) && userProgress.length > 0 ? userProgress[0] as any : {};
    const hours = Array.isArray(studyHours) && studyHours.length > 0 ? studyHours[0] as any : { study_hours: 0 };
    const tests = Array.isArray(testsCompleted) && testsCompleted.length > 0 ? testsCompleted[0] as any : { tests_completed: 0 };
    
    const data = {
      total_points: progress.total_points || 0,
      current_level: progress.current_level || 'Iron',
      streak_days: progress.streak_days || 0,
      questions_solved: (progress.prelims_questions || 0) + (progress.mains_questions || 0),
      study_hours: Math.round(hours.study_hours || 0),
      tests_completed: tests.tests_completed || 0
    };
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json({ 
      data: {
        total_points: 0,
        current_level: 'Iron',
        streak_days: 0,
        questions_solved: 0,
        study_hours: 0,
        tests_completed: 0
      }
    });
  }
}