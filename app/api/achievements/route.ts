import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    const [achievements] = await connection.execute(`
      SELECT a.*, ua.earned_at,
             CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = 1
      ORDER BY a.id
    `);
    
    await connection.end();
    
    return NextResponse.json({ data: achievements });
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return NextResponse.json({ data: [] });
  }
}