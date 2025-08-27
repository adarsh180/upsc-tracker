import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(request: Request) {
  let connection;
  try {
    connection = await getConnection();
    const { id, updates } = await request.json();

    // Validate input
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Filter out fields that don't exist in the database yet
    const allowedFields = ['total_lectures', 'total_dpps', 'completed_lectures', 'completed_dpps', 'revisions'];
    const filteredUpdates: any = {};
    
    // Add basic fields
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Try to add new fields if they exist
    try {
      if (updates.completed_lectures_list !== undefined) {
        filteredUpdates.completed_lectures_list = updates.completed_lectures_list;
      }
      if (updates.completed_dpps_list !== undefined) {
        filteredUpdates.completed_dpps_list = updates.completed_dpps_list;
      }
    } catch (e) {
      // Ignore if columns don't exist
    }

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);
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
