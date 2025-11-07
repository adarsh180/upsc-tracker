import { NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Drop existing current_affairs table if it exists
    await connection.execute('DROP TABLE IF EXISTS current_affairs');
    
    // Create new current_affairs table with correct structure
    await connection.execute(`
      CREATE TABLE current_affairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500),
        content TEXT,
        category VARCHAR(100),
        importance ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        source ENUM('The Hindu', 'Indian Express') DEFAULT 'The Hindu',
        source_url TEXT,
        tags JSON,
        upsc_relevance INT DEFAULT 75,
        is_bookmarked BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true, message: 'Database fixed successfully' });
  } catch (error) {
    console.error('Database fix error:', error);
    return NextResponse.json({ error: 'Database fix failed' }, { status: 500 });
  }
}