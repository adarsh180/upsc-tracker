import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [flashcards] = await connection.execute(
      'SELECT * FROM flashcards WHERE user_id = 1 ORDER BY created_at DESC'
    );
    
    await connection.end();
    
    return NextResponse.json({ data: flashcards });
  } catch (error) {
    console.error('Failed to fetch flashcards:', error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, question, answer, difficulty } = await request.json();
    
    const connection = await getConnection();
    
    await connection.execute(
      'INSERT INTO flashcards (user_id, subject, question, answer, difficulty) VALUES (1, ?, ?, ?, ?)',
      [subject, question, answer, difficulty]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save flashcard:', error);
    return NextResponse.json({ error: 'Failed to save flashcard' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const connection = await getConnection();
    
    await connection.execute(
      'DELETE FROM flashcards WHERE id = ? AND user_id = 1',
      [id]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}