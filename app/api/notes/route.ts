import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [notes] = await connection.execute(
      'SELECT * FROM study_notes WHERE user_id = 1 ORDER BY created_at DESC'
    );
    
    await connection.end();
    
    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, topic, content, tags } = await request.json();
    
    const connection = await getConnection();
    
    await connection.execute(
      'INSERT INTO study_notes (user_id, subject, topic, content, tags) VALUES (1, ?, ?, ?, ?)',
      [subject, topic, content, JSON.stringify(tags)]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const connection = await getConnection();
    
    await connection.execute(
      'DELETE FROM study_notes WHERE id = ? AND user_id = 1',
      [id]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}