import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const connection = await getConnection();
    
    // Study Hours Trend
    const [studyHours] = await connection.execute(`
      SELECT DATE(created_at) as date, SUM(duration_minutes)/60 as hours
      FROM study_sessions 
      WHERE user_id = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days]);

    // Subject Progress
    const [subjectProgress] = await connection.execute(`
      SELECT subject, 
             ROUND((completed_lectures / GREATEST(total_lectures, 1)) * 100) as completion
      FROM subject_progress 
      WHERE user_id = 1
      ORDER BY completion DESC
    `);

    // Weekly Performance
    const [weeklyPerformance] = await connection.execute(`
      SELECT WEEK(attempted_at) as week_num,
             CONCAT('Week ', WEEK(attempted_at)) as week,
             COUNT(*) as tests,
             ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as accuracy
      FROM question_attempts qa
      WHERE qa.user_id = 1 AND qa.attempted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY WEEK(attempted_at)
      ORDER BY week_num
    `, [days]);

    // Mood Correlation
    const [moodCorrelation] = await connection.execute(`
      SELECT me.mood,
             COUNT(*) as count,
             COALESCE(AVG(sa.productivity_score), 75) as productivity
      FROM mood_entries me
      LEFT JOIN study_analytics sa ON DATE(me.date) = DATE(sa.date) AND me.user_id = sa.user_id
      WHERE me.user_id = 1 AND me.date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY me.mood
      ORDER BY productivity DESC
    `, [days]);

    // Time Distribution
    const [timeDistribution] = await connection.execute(`
      SELECT HOUR(start_time) as hour, COUNT(*) as sessions
      FROM study_sessions
      WHERE user_id = 1 AND start_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY HOUR(start_time)
      ORDER BY hour
    `, [days]);

    // Streak Data
    const [streakData] = await connection.execute(`
      SELECT date, 
             CASE WHEN COUNT(*) > 0 THEN true ELSE false END as active
      FROM (
        SELECT DATE(created_at) as date FROM study_sessions WHERE user_id = 1
        UNION
        SELECT DATE(attempted_at) as date FROM question_attempts WHERE user_id = 1
        UNION  
        SELECT date FROM daily_goals WHERE user_id = 1
      ) activity
      WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY date
      ORDER BY date
    `, [days]);

    await connection.end();

    const data = {
      studyHours: Array.isArray(studyHours) ? studyHours.map((row: any) => ({
        date: new Date(row.date).toLocaleDateString(),
        hours: Math.round(row.hours * 10) / 10
      })) : [],
      
      subjectProgress: Array.isArray(subjectProgress) ? subjectProgress.map((row: any, index: number) => ({
        subject: row.subject,
        completion: row.completion,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
      })) : [],
      
      weeklyPerformance: Array.isArray(weeklyPerformance) ? weeklyPerformance : [],
      
      moodCorrelation: Array.isArray(moodCorrelation) ? moodCorrelation : [],
      
      timeDistribution: Array.isArray(timeDistribution) ? timeDistribution : [],
      
      streakData: Array.isArray(streakData) ? streakData : []
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ 
      data: {
        studyHours: [],
        subjectProgress: [],
        weeklyPerformance: [],
        moodCorrelation: [],
        timeDistribution: [],
        streakData: []
      }
    });
  }
}