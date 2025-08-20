import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Remove duplicates, keep only the first occurrence of each subject
    await connection.execute(`
      DELETE s1 FROM subject_progress s1
      INNER JOIN subject_progress s2 
      WHERE s1.id > s2.id 
      AND s1.subject = s2.subject 
      AND s1.category = s2.category 
      AND s1.user_id = s2.user_id
    `);
    
    await connection.end();
    
    return NextResponse.json({ success: true, message: 'Duplicates removed successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup duplicates' }, { status: 500 });
  }
}