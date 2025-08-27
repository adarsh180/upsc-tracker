import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const conn = await connection;

    // Efficiency metrics (topics per hour, questions per hour)
    const [efficiencyRows] = await conn.execute(`
      SELECT 
        DATE(date) as date,
        SUM(hours_studied) as total_hours,
        SUM(topics_covered) as total_topics,
        SUM(questions_solved) as total_questions,
        CASE 
          WHEN SUM(hours_studied) > 0 THEN ROUND(SUM(topics_covered) / SUM(hours_studied), 2)
          ELSE 0 
        END as topics_per_hour,
        CASE 
          WHEN SUM(hours_studied) > 0 THEN ROUND(SUM(questions_solved) / SUM(hours_studied), 2)
          ELSE 0 
        END as questions_per_hour
      FROM daily_goals 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(date)
      ORDER BY date DESC
    `);

    // Weekly heatmap data
    const [heatmapRows] = await conn.execute(`
      SELECT 
        DAYOFWEEK(date) as day_of_week,
        HOUR(created_at) as hour,
        COUNT(*) as sessions,
        SUM(hours_studied) as total_hours
      FROM daily_goals 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY DAYOFWEEK(date), HOUR(created_at)
      ORDER BY day_of_week, hour
    `);

    // Subject performance analysis
    const [subjectRows] = await conn.execute(`
      SELECT 
        subject,
        COUNT(*) as sessions,
        SUM(hours_studied) as total_hours,
        AVG(hours_studied) as avg_hours_per_session,
        SUM(topics_covered) as total_topics,
        AVG(topics_covered) as avg_topics_per_session,
        SUM(questions_solved) as total_questions
      FROM daily_goals 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY subject
      ORDER BY total_hours DESC
    `);

    // Generate AI insights
    const aiInsights = await generateAIInsights(efficiencyRows, subjectRows);

    return NextResponse.json({
      efficiency: efficiencyRows,
      heatmap: heatmapRows,
      subjects: subjectRows,
      aiInsights
    });

  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch advanced analytics' }, { status: 500 });
  }
}

async function generateAIInsights(efficiencyData: any[], subjectData: any[]) {
  try {
    const totalHours = subjectData.reduce((sum, s) => sum + parseFloat(s.total_hours), 0);
    const avgEfficiency = efficiencyData.reduce((sum, e) => sum + parseFloat(e.topics_per_hour), 0) / efficiencyData.length;
    const topSubject = subjectData[0]?.subject || 'N/A';

    const insights = [
      `📊 You've studied ${totalHours.toFixed(1)} hours across ${subjectData.length} subjects in the last 30 days.`,
      `🎯 Your average efficiency is ${avgEfficiency.toFixed(1)} topics per hour.`,
      `📚 ${topSubject} is your most studied subject with ${subjectData[0]?.total_hours || 0} hours.`,
      `💡 Consider balancing your study time across different subjects for comprehensive preparation.`
    ];

    return insights.join('\n\n');
  } catch (error) {
    return 'AI insights temporarily unavailable. Keep up the great work with your studies!';
  }
}