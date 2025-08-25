import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper function to get current IST date
function getCurrentISTDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getCurrentISTDate();
    
    const connection = await getConnection();
    
    // Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        date DATE,
        subject VARCHAR(100),
        hours_studied DECIMAL(3,1) DEFAULT 0,
        topics_covered INT DEFAULT 0,
        questions_solved INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM daily_goals WHERE user_id = 1 AND date = ? ORDER BY created_at DESC',
      [date]
    );
    releaseConnection(connection);
    
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, subject, hours_studied, topics_covered, questions_solved, notes } = body;
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO daily_goals (user_id, date, subject, hours_studied, topics_covered, questions_solved, notes) VALUES (1, ?, ?, ?, ?, ?, ?)',
      [date, subject, hours_studied || 0, topics_covered || 0, questions_solved || 0, notes || '']
    );
    releaseConnection(connection);
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, subject, hours_studied, topics_covered, questions_solved, notes } = body;
    
    const connection = await getConnection();
    await connection.execute(
      'UPDATE daily_goals SET subject = ?, hours_studied = ?, topics_covered = ?, questions_solved = ?, notes = ? WHERE id = ?',
      [subject, hours_studied, topics_covered, questions_solved || 0, notes, id]
    );
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const connection = await getConnection();
    await connection.execute('DELETE FROM daily_goals WHERE id = ?', [id]);
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}