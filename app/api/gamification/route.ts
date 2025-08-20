import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

const LEVELS = [
  { name: 'Iron', prelims: 0, mains: 0, color: 'text-gray-400' },
  { name: 'Bronze', prelims: 3000, mains: 500, color: 'text-orange-600' },
  { name: 'Silver', prelims: 6000, mains: 1000, color: 'text-gray-300' },
  { name: 'Gold', prelims: 12000, mains: 2000, color: 'text-yellow-400' },
  { name: 'Platinum', prelims: 18000, mains: 3000, color: 'text-blue-400' },
  { name: 'Diamond', prelims: 24000, mains: 4000, color: 'text-purple-400' },
  { name: 'Master', prelims: 30000, mains: 5000, color: 'text-red-400' }
];

function calculateLevel(prelims: number, mains: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (prelims >= LEVELS[i].prelims && mains >= LEVELS[i].mains) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export async function GET() {
  try {
    const connection = await getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        prelims_questions INT DEFAULT 0,
        mains_questions INT DEFAULT 0,
        current_level VARCHAR(50) DEFAULT 'Iron',
        total_points INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        last_activity DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default record if none exists
    await connection.execute(`
      INSERT IGNORE INTO user_progress (user_id, prelims_questions, mains_questions, current_level) 
      VALUES (1, 0, 0, 'Iron')
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM user_progress WHERE user_id = 1'
    );
    await connection.end();
    
    const progress = (Array.isArray(rows) ? rows[0] : null) || { prelims_questions: 0, mains_questions: 0 };
    const progressData = progress as any;
    const level = calculateLevel(progressData.prelims_questions || 0, progressData.mains_questions || 0);
    
    return NextResponse.json({ 
      ...progressData, 
      prelims_questions: progressData.prelims_questions || 0,
      mains_questions: progressData.mains_questions || 0,
      level, 
      levels: LEVELS 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      prelims_questions: 0, 
      mains_questions: 0, 
      level: LEVELS[0], 
      levels: LEVELS 
    }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { prelims_questions, mains_questions } = await request.json();
    
    const connection = await getConnection();
    const level = calculateLevel(prelims_questions || 0, mains_questions || 0);
    
    await connection.execute(
      'INSERT INTO user_progress (user_id, prelims_questions, mains_questions, current_level, last_activity) VALUES (1, ?, ?, ?, CURDATE()) ON DUPLICATE KEY UPDATE prelims_questions = ?, mains_questions = ?, current_level = ?, last_activity = CURDATE()',
      [prelims_questions || 0, mains_questions || 0, level.name, prelims_questions || 0, mains_questions || 0, level.name]
    );
    await connection.end();
    
    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update gamification data' }, { status: 500 });
  }
}