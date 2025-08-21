import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS current_affairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        completed_topics INT DEFAULT 0,
        total_topics INT DEFAULT 300,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM current_affairs WHERE user_id = 1'
    );
    releaseConnection(connection);
    
    const result = Array.isArray(rows) ? rows[0] : null;
    return NextResponse.json(result || { completed_topics: 0, total_topics: 300 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ completed_topics: 0, total_topics: 300 }, { status: 200 });
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
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update current affairs' }, { status: 500 });
  }
}