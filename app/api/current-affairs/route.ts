import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Use existing current_affairs table structure
    const [tableCheck] = await connection.execute(
      "SHOW TABLES LIKE 'current_affairs'"
    );
    
    if ((tableCheck as any[]).length === 0) {
      await connection.execute(`
        CREATE TABLE current_affairs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT 1,
          total_topics INT DEFAULT 300,
          completed_topics INT DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user (user_id)
        )
      `);
      
      // Insert default record
      await connection.execute(
        'INSERT INTO current_affairs (user_id, total_topics, completed_topics) VALUES (1, 300, 0)'
      );
    }
    
    // Get current affairs progress
    const [rows] = await connection.execute(
      'SELECT * FROM current_affairs WHERE user_id = 1'
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ data: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { completed_topics } = await request.json();
    const connection = await getConnection();
    
    await connection.execute(
      'UPDATE current_affairs SET completed_topics = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = 1',
      [completed_topics]
    );
    
    releaseConnection(connection);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}