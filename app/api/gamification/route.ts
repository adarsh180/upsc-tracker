import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gamification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        current_streak INT DEFAULT 0,
        highest_streak INT DEFAULT 0,
        last_activity_date DATE,
        total_achievements INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM gamification WHERE user_id = 1'
    );
    
    let gamificationData;
    if (Array.isArray(rows) && rows.length > 0) {
      gamificationData = rows[0];
    } else {
      await connection.execute(
        'INSERT INTO gamification (user_id) VALUES (1)'
      );
      gamificationData = { current_streak: 0, highest_streak: 0, total_achievements: 0 };
    }
    
    releaseConnection(connection);
    return NextResponse.json(gamificationData);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hours_studied, questions_solved } = await request.json();
    const connection = await getConnection();
    
    // Get current IST date
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const today = istTime.toISOString().split('T')[0];
    
    // Get current gamification data
    const [existing] = await connection.execute(
      'SELECT * FROM gamification WHERE user_id = 1'
    );
    
    let currentStreak = 0;
    let highestStreak = 0;
    let achievements = 0;
    
    if (Array.isArray(existing) && existing.length > 0) {
      const data = existing[0] as any;
      const lastActivityDate = data.last_activity_date;
      
      if (lastActivityDate) {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Same day, no streak change
          currentStreak = data.current_streak;
        } else if (diffDays === 1) {
          // Next day, increment streak
          currentStreak = data.current_streak + 1;
        } else {
          // Gap > 1 day, reset streak
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      highestStreak = Math.max(currentStreak, data.highest_streak);
      achievements = data.total_achievements;
    } else {
      currentStreak = 1;
      highestStreak = 1;
    }
    
    // Check for achievements
    if (hours_studied >= 8) achievements++;
    if (questions_solved >= 100) achievements++;
    
    // Update gamification data
    await connection.execute(`
      INSERT INTO gamification (user_id, current_streak, highest_streak, last_activity_date, total_achievements)
      VALUES (1, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      current_streak = VALUES(current_streak),
      highest_streak = VALUES(highest_streak),
      last_activity_date = VALUES(last_activity_date),
      total_achievements = VALUES(total_achievements)
    `, [currentStreak, highestStreak, today, achievements]);
    
    releaseConnection(connection);
    
    const achievementMessages: string[] = [];
    
    // Add achievement messages
    if (hours_studied >= 8) {
      achievementMessages.push('🔥 Study Champion! 8+ hours today!');
    }
    if (questions_solved >= 100) {
      achievementMessages.push('🎯 Question Master! 100+ questions solved!');
    }
    
    const response = {
      current_streak: currentStreak,
      highest_streak: highestStreak,
      achievements: achievementMessages,
      total_achievements: achievements
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update gamification' }, { status: 500 });
  }
}