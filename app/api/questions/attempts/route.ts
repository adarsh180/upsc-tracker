import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Create attempts table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS question_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        question_id INT,
        selected_answer VARCHAR(10),
        is_correct BOOLEAN,
        time_taken INT,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);
    
    const [rows] = await connection.execute(
      'SELECT * FROM question_attempts WHERE user_id = 1 ORDER BY attempted_at DESC'
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question_id, selected_answer, is_correct, time_taken } = await request.json();
    
    const connection = await getConnection();
    
    await connection.execute(
      'INSERT INTO question_attempts (user_id, question_id, selected_answer, is_correct, time_taken) VALUES (1, ?, ?, ?, ?)',
      [question_id, selected_answer, is_correct, time_taken]
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
  }
}