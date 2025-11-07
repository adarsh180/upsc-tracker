import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    const connection = await getConnection();
    
    // Toggle bookmark status
    await connection.execute(
      'UPDATE current_affairs SET is_bookmarked = NOT is_bookmarked WHERE id = ?',
      [id]
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}