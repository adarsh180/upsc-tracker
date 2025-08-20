import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();

    // Create mood_entries table with all required fields
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        mood VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);

    return NextResponse.json({ message: 'Mood entries table created successfully' });
  } catch (error) {
    console.error('Failed to create mood entries table:', error);
    return NextResponse.json({ error: 'Failed to create mood entries table' }, { status: 500 });
  }
}
