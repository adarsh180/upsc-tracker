import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Add missing columns to current_affairs_content table
    try {
      await connection.execute(`
        ALTER TABLE current_affairs_content 
        ADD COLUMN source_url TEXT,
        ADD COLUMN upsc_relevance INT DEFAULT 75
      `);
    } catch (error: any) {
      // Ignore error if columns already exist
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }
    
    await connection.end();
    
    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}