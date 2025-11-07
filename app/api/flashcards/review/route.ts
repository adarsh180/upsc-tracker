import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id, correct } = await request.json();
    
    const connection = await getConnection();
    
    // Get current stats
    const [current] = await connection.execute(
      'SELECT review_count, success_rate FROM flashcards WHERE id = ? AND user_id = 1',
      [id]
    );
    
    if (Array.isArray(current) && current.length > 0) {
      const card = current[0] as any;
      const newReviewCount = card.review_count + 1;
      const currentSuccesses = Math.round((card.success_rate / 100) * card.review_count);
      const newSuccesses = currentSuccesses + (correct ? 1 : 0);
      const newSuccessRate = (newSuccesses / newReviewCount) * 100;
      
      await connection.execute(
        'UPDATE flashcards SET review_count = ?, success_rate = ?, last_reviewed = CURDATE() WHERE id = ? AND user_id = 1',
        [newReviewCount, newSuccessRate, id]
      );
    }
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}