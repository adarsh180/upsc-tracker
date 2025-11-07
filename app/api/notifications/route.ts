import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [notifications] = await connection.execute(
      'SELECT * FROM notifications WHERE user_id = 1 ORDER BY created_at DESC LIMIT 50'
    );
    
    await connection.end();
    
    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ data: [] });
  }
}