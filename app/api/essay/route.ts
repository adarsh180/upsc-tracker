import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM essay_progress WHERE user_id = 1'
    );
    releaseConnection(connection);
    
    const result = Array.isArray(rows) ? rows[0] : null;
    return NextResponse.json(result || { lectures_completed: 0, essays_written: 0, total_lectures: 10, total_essays: 100 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch essay progress' }, { status: 500 });
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
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update essay progress' }, { status: 500 });
  }
}