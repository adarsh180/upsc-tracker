import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC'
    );
    await connection.end();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_type, test_category, subject, total_marks, scored_marks, attempt_date } = body;
    
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO test_records (user_id, test_type, test_category, subject, total_marks, scored_marks, attempt_date) VALUES (1, ?, ?, ?, ?, ?, ?)',
      [test_type, test_category, subject, total_marks, scored_marks, attempt_date]
    );
    await connection.end();
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create test record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, test_type, test_category, subject, total_marks, scored_marks, attempt_date } = body;
    
    const connection = await getConnection();
    await connection.execute(
      'UPDATE test_records SET test_type = ?, test_category = ?, subject = ?, total_marks = ?, scored_marks = ?, attempt_date = ? WHERE id = ?',
      [test_type, test_category, subject, total_marks, scored_marks, attempt_date, id]
    );
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update test record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const connection = await getConnection();
    await connection.execute('DELETE FROM test_records WHERE id = ?', [id]);
    await connection.end();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete test record' }, { status: 500 });
  }
}