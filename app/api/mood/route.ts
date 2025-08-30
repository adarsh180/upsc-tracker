import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL DEFAULT 1,
        date DATE NOT NULL,
        mood VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC LIMIT 30'
    );
    
    await connection.end();
    
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, mood, note } = body;
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO mood_entries (user_id, date, mood, note) VALUES (1, ?, ?, ?) ON DUPLICATE KEY UPDATE mood = ?, note = ?',
      [date, mood, note || '', mood, note || '']
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save mood entry' }, { status: 500 });
  }
}