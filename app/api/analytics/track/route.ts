import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    const connection = await getConnection();
    
    switch (type) {
      case 'study_session':
        await connection.execute(`
          INSERT INTO study_sessions (user_id, date, hours, subject)
          VALUES (1, CURDATE(), ?, ?)
          ON DUPLICATE KEY UPDATE hours = hours + VALUES(hours)
        `, [data.hours, data.subject]);
        break;
        
      case 'mood_update':
        await connection.execute(`
          INSERT INTO mood_tracking (user_id, date, mood, productivity)
          VALUES (1, CURDATE(), ?, ?)
          ON DUPLICATE KEY UPDATE mood = VALUES(mood), productivity = VALUES(productivity)
        `, [data.mood, data.productivity]);
        break;
        
      case 'subject_progress':
        // This is automatically tracked when subject_progress table is updated
        // We can add additional study session tracking here
        const studyHours = Math.min(2, Math.max(0.5, data.progress_change * 0.1));
        await connection.execute(`
          INSERT INTO study_sessions (user_id, date, hours, subject)
          VALUES (1, CURDATE(), ?, ?)
          ON DUPLICATE KEY UPDATE hours = hours + VALUES(hours)
        `, [studyHours, data.subject]);
        break;
    }
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}