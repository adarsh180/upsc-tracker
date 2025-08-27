import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS psir_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        section_name VARCHAR(100),
        total_items INT DEFAULT 250,
        completed_items INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_section (user_id, section_name)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM psir_progress WHERE user_id = 1'
    );
    releaseConnection(connection);
    
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch PSIR progress' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { section_name, completed_items } = await request.json();
    
    const connection = await getConnection();
    
    const [existing] = await connection.execute(
      'SELECT id FROM psir_progress WHERE user_id = 1 AND section_name = ?',
      [section_name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      await connection.execute(
        'UPDATE psir_progress SET completed_items = ? WHERE user_id = 1 AND section_name = ?',
        [completed_items, section_name]
      );
    } else {
      const totalItems = section_name === 'Lectures' ? 250 : 
                        section_name === 'Tests' ? 500 : 150;
      await connection.execute(
        'INSERT INTO psir_progress (user_id, section_name, completed_items, total_items) VALUES (1, ?, ?, ?)',
        [section_name, completed_items, totalItems]
      );
    }
    
    releaseConnection(connection);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update PSIR progress' }, { status: 500 });
  }
}