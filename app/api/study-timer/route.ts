import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { subject, duration, type } = await request.json();
    
    const connection = await getConnection();
    
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    await connection.execute(
      'INSERT INTO study_sessions (user_id, subject, start_time, end_time, duration_minutes, session_type) VALUES (1, ?, ?, ?, ?, ?)',
      [subject || 'General Study', startTime, endTime, duration, type]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save study session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [sessions] = await connection.execute(
      'SELECT * FROM study_sessions WHERE user_id = 1 AND DATE(created_at) = CURDATE() ORDER BY created_at DESC'
    );
    
    await connection.end();
    
    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error('Failed to fetch study sessions:', error);
    return NextResponse.json({ data: [] });
  }
}