import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS optional_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        section_name VARCHAR(100),
        total_items INT DEFAULT 140,
        completed_items INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM optional_progress WHERE user_id = 1'
    );
    await connection.end();
    
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch optional progress' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { section_name, completed_items } = await request.json();
    
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO optional_progress (user_id, section_name, completed_items, total_items) VALUES (1, ?, ?, 140) ON DUPLICATE KEY UPDATE completed_items = ?',
      [section_name, completed_items, completed_items]
    );
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update optional progress' }, { status: 500 });
  }
}