import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Create table first
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
      'SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC'
    );
    await connection.end();
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch mood entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, mood, note } = await request.json();
    
    // Convert date to IST if needed
    const istDate = new Date(date);
    // Format date as YYYY-MM-DD
    const formattedDate = istDate.toISOString().split('T')[0];
    
    const connection = await getConnection();
    
    // Create table first
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
    
    await connection.execute(
      'INSERT INTO mood_entries (user_id, date, mood, note) VALUES (1, ?, ?, ?) ON DUPLICATE KEY UPDATE mood = ?, note = ?, updated_at = CURRENT_TIMESTAMP',
      [formattedDate, mood, note || null, mood, note || null]
    );
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 });
  }
}