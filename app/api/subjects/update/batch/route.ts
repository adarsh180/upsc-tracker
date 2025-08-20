import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const connection = await getConnection();
    const { id, updates } = await request.json();

    // Validate input
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update multiple fields at once
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const updateString = fields.map(field => `${field} = ?`).join(', ');

    await connection.execute(
      `UPDATE subject_progress SET ${updateString} WHERE id = ?`,
      [...values, id]
    );

    // Get updated record
    const [rows] = await connection.execute(
      'SELECT * FROM subject_progress WHERE id = ?',
      [id]
    ) as [any[], any];

    await connection.end();

    return NextResponse.json({ 
      message: 'Subject updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Failed to update subject:', error);
    try {
      await connection?.end();
    } catch (e) {}
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
