import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const connection = await getConnection();
    const { id, field, value } = await request.json();
    
    // Validate field name to prevent SQL injection
    const allowedFields = ['total_lectures', 'completed_lectures', 'total_dpps', 'completed_dpps', 'revisions'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    // Update the specific field for the subject
    await connection.execute(
      `UPDATE subject_progress SET ${field} = ? WHERE id = ?`,
      [Math.max(0, value), id]
    );

    return NextResponse.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Failed to update subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
