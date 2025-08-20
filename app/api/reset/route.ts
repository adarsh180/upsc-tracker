import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Clear all existing data
    await connection.execute('DELETE FROM subject_progress WHERE user_id = 1');
    await connection.execute('DELETE FROM current_affairs WHERE user_id = 1');
    await connection.execute('DELETE FROM essay_progress WHERE user_id = 1');
    await connection.execute('DELETE FROM test_records WHERE user_id = 1');
    await connection.execute('DELETE FROM daily_goals WHERE user_id = 1');
    await connection.execute('DELETE FROM mood_entries WHERE user_id = 1');
    
    // Reset auto increment
    await connection.execute('ALTER TABLE subject_progress AUTO_INCREMENT = 1');
    
    await connection.end();
    
    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}