import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  let connection;
  try {
    connection = await getConnection();

    // Add new columns for storing individual completion status
    await connection.execute(`
      ALTER TABLE subject_progress 
      ADD COLUMN completed_lectures_list TEXT DEFAULT NULL,
      ADD COLUMN completed_dpps_list TEXT DEFAULT NULL
    `);

    await connection.end();

    return NextResponse.json({ 
      message: 'Database migration completed successfully',
      changes: 'Added completed_lectures_list and completed_dpps_list columns'
    });
  } catch (error) {
    console.error('Migration failed:', error);
    try {
      await connection?.end();
    } catch (e) {}
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}