import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { id, field, count } = await request.json();
    
    const connection = await getConnection();
    
    await connection.execute(
      `UPDATE subject_progress SET ${field} = ? WHERE id = ?`,
      [count, id]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update count error:', error);
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}