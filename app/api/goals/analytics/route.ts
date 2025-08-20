import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Daily progress (last 30 days)
    const [dailyData] = await connection.execute(`
      SELECT 
        DATE(date) as date,
        COALESCE(SUM(hours_studied), 0) as hours,
        COALESCE(SUM(topics_covered), 0) as topics,
        COALESCE(SUM(questions_solved), 0) as questions,
        COUNT(*) as sessions
      FROM daily_goals 
      WHERE user_id = 1 AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(date)
      ORDER BY DATE(date) ASC
    `);

    // Weekly progress (last 12 weeks)
    const [weeklyData] = await connection.execute(`
      SELECT 
        YEAR(date) as year,
        WEEK(date, 1) as week,
        COALESCE(SUM(hours_studied), 0) as hours,
        COALESCE(SUM(topics_covered), 0) as topics,
        COALESCE(SUM(questions_solved), 0) as questions,
        COUNT(*) as sessions
      FROM daily_goals 
      WHERE user_id = 1 AND date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
      GROUP BY YEAR(date), WEEK(date, 1)
      ORDER BY YEAR(date), WEEK(date, 1) ASC
    `);

    // Monthly progress (last 12 months)
    const [monthlyData] = await connection.execute(`
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month_num,
        COALESCE(SUM(hours_studied), 0) as hours,
        COALESCE(SUM(topics_covered), 0) as topics,
        COALESCE(SUM(questions_solved), 0) as questions,
        COUNT(*) as sessions
      FROM daily_goals 
      WHERE user_id = 1 AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date), MONTH(date) ASC
    `);

    // Lifetime totals
    const [lifetimeData] = await connection.execute(`
      SELECT 
        COALESCE(SUM(hours_studied), 0) as total_hours,
        COALESCE(SUM(topics_covered), 0) as total_topics,
        COALESCE(SUM(questions_solved), 0) as total_questions,
        COUNT(*) as total_sessions,
        COUNT(DISTINCT date) as study_days,
        MIN(date) as first_study_date,
        MAX(date) as last_study_date
      FROM daily_goals 
      WHERE user_id = 1
    `);

    await connection.end();

    return NextResponse.json({
      daily: Array.isArray(dailyData) ? dailyData : [],
      weekly: Array.isArray(weeklyData) ? weeklyData : [],
      monthly: Array.isArray(monthlyData) ? monthlyData : [],
      lifetime: Array.isArray(lifetimeData) && lifetimeData.length > 0 ? lifetimeData[0] : {
        total_hours: 0,
        total_topics: 0,
        total_questions: 0,
        total_sessions: 0,
        study_days: 0
      }
    });
  } catch (error) {
    console.error('Goals analytics error:', error);
    return NextResponse.json({
      daily: [],
      weekly: [],
      monthly: [],
      lifetime: {
        total_hours: 0,
        total_topics: 0,
        total_questions: 0,
        total_sessions: 0,
        study_days: 0
      }
    }, { status: 200 });
  }
}