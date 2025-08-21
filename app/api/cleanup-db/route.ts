import { NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Clean up and recreate tables with proper constraints
    await connection.execute('DROP TABLE IF EXISTS essay_progress');
    await connection.execute('DROP TABLE IF EXISTS current_affairs');
    await connection.execute('DROP TABLE IF EXISTS optional_progress');
    
    // Recreate essay_progress with unique constraint
    await connection.execute(`
      CREATE TABLE essay_progress (
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
    
    // Recreate current_affairs with unique constraint
    await connection.execute(`
      CREATE TABLE current_affairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        total_topics INT DEFAULT 300,
        completed_topics INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
    
    // Recreate optional_progress with unique constraint
    await connection.execute(`
      CREATE TABLE optional_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        section_name VARCHAR(100),
        total_items INT DEFAULT 140,
        completed_items INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_section (user_id, section_name)
      )
    `);
    
    releaseConnection(connection);
    return NextResponse.json({ success: true, message: 'Database cleaned and recreated' });
  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup database' }, { status: 500 });
  }
}