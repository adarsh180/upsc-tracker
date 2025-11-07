import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    const connection = await getConnection();
    
    // Mark as read
    await connection.execute(
      'UPDATE current_affairs SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}