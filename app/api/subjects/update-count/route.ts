import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Whitelist of allowed fields to prevent SQL injection
const ALLOWED_FIELDS = [
  'total_lectures', 
  'completed_lectures', 
  'total_dpps', 
  'completed_dpps', 
  'revisions',
  'questions_count'
];

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { id, field, count } = await request.json();
    
    // Input validation
    if (!id || !field || count === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, field, count' 
      }, { status: 400 });
    }

    // Validate field name against whitelist
    if (!ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ 
        error: 'Invalid field name' 
      }, { status: 400 });
    }

    // Validate count is a number
    const numericCount = parseInt(count);
    if (isNaN(numericCount) || numericCount < 0) {
      return NextResponse.json({ 
        error: 'Count must be a non-negative number' 
      }, { status: 400 });
    }
    
    connection = await getConnection();
    
    // Use parameterized query with validated field name
    await connection.execute(
      `UPDATE subject_progress SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [numericCount, id]
    );
    
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update count error:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
    return NextResponse.json({ error: 'Failed to update count' }, { status: 500 });
  }
}