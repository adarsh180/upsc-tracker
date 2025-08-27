import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_section (user_id, section_name)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM optional_progress WHERE user_id = 1'
    );
    releaseConnection(connection);
    
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
    
    // First check if record exists
    const [existing] = await connection.execute(
      'SELECT id FROM optional_progress WHERE user_id = 1 AND section_name = ?',
      [section_name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing record
      await connection.execute(
        'UPDATE optional_progress SET completed_items = ? WHERE user_id = 1 AND section_name = ?',
        [completed_items, section_name]
      );
    } else {
      // Insert new record
      const totalItems = section_name === 'Tests' ? 500 : 140;
      await connection.execute(
        'INSERT INTO optional_progress (user_id, section_name, completed_items, total_items) VALUES (1, ?, ?, ?)',
        [section_name, completed_items, totalItems]
      );
    }
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update optional progress' }, { status: 500 });
  }
}