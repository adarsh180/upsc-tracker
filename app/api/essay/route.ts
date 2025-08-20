import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS essay_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        lectures_completed INT DEFAULT 0,
        essays_written INT DEFAULT 0,
        total_lectures INT DEFAULT 10,
        total_essays INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM essay_progress WHERE user_id = 1'
    );
    await connection.end();
    
    const result = Array.isArray(rows) ? rows[0] : null;
    return NextResponse.json(result || { lectures_completed: 0, essays_written: 0, total_lectures: 10, total_essays: 100 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ lectures_completed: 0, essays_written: 0, total_lectures: 10, total_essays: 100 }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { lectures_completed, essays_written } = await request.json();
    
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO essay_progress (user_id, lectures_completed, essays_written, total_lectures, total_essays) VALUES (1, ?, ?, 10, 100) ON DUPLICATE KEY UPDATE lectures_completed = ?, essays_written = ?',
      [lectures_completed, essays_written, lectures_completed, essays_written]
    );
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update essay progress' }, { status: 500 });
  }
}