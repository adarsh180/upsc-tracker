import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM current_affairs WHERE user_id = 1'
    );
    await connection.end();
    
    const result = Array.isArray(rows) ? rows[0] : null;
    return NextResponse.json(result || { completed_topics: 0, total_topics: 300 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch current affairs' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { completed_topics } = await request.json();
    
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO current_affairs (user_id, completed_topics, total_topics) VALUES (1, ?, 300) ON DUPLICATE KEY UPDATE completed_topics = ?',
      [completed_topics, completed_topics]
    );
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update current affairs' }, { status: 500 });
  }
}