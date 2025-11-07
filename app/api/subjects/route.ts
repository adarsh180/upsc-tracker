import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';
import { getCachedData, setCachedData } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check cache first
    const cached = getCachedData('subjects');
    if (cached) {
      return NextResponse.json(cached);
    }
    
    const connection = await getConnection();
    
    // Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subject_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        category VARCHAR(50),
        total_lectures INT DEFAULT 0,
        completed_lectures INT DEFAULT 0,
        total_dpps INT DEFAULT 0,
        completed_dpps INT DEFAULT 0,
        questions_count INT DEFAULT 0,
        revisions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add questions_count column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE subject_progress ADD COLUMN questions_count INT DEFAULT 0
      `);
    } catch (e) {
      // Column already exists
    }
    
    // Clean up duplicates safely
    try {
      await connection.execute(`
        DELETE t1 FROM subject_progress t1
        INNER JOIN subject_progress t2
        WHERE t1.id > t2.id
        AND t1.subject = t2.subject
        AND t1.category = t2.category
        AND t1.user_id = t2.user_id
      `);
    } catch (cleanupError) {
      console.log('No duplicates to clean up');
    }

    const [rows] = await connection.execute(
      'SELECT * FROM subject_progress WHERE user_id = 1 ORDER BY category, subject'
    );
    releaseConnection(connection);
    
    const data = Array.isArray(rows) ? rows : [];
    setCachedData('subjects', data, 2 * 60 * 1000); // Cache for 2 minutes
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, category, total_lectures, total_dpps } = body;
    
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO subject_progress (user_id, subject, category, total_lectures, total_dpps) VALUES (1, ?, ?, ?, ?)',
      [subject, category, total_lectures, total_dpps]
    );
    releaseConnection(connection);
    
    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, field, value } = body;
    
    const connection = await getConnection();
    
    // If updating completed_dpps, also update questions_count
    if (field === 'completed_dpps') {
      const [current] = await connection.execute(
        'SELECT completed_dpps FROM subject_progress WHERE id = ?',
        [id]
      );
      const currentDpps = (current as any[])[0]?.completed_dpps || 0;
      const newDpps = parseInt(value);
      const dppDifference = newDpps - currentDpps;
      
      if (dppDifference > 0) {
        // Add random questions (5-30) for each new DPP
        const randomQuestions = Array.from({length: dppDifference}, () => 
          Math.floor(Math.random() * 26) + 5
        ).reduce((sum, q) => sum + q, 0);
        
        await connection.execute(
          'UPDATE subject_progress SET completed_dpps = ?, questions_count = questions_count + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [value, randomQuestions, id]
        );
      } else if (dppDifference < 0) {
        // Remove questions proportionally when DPPs are reduced
        const questionsToRemove = Math.abs(dppDifference) * 15; // Average of 5-30
        await connection.execute(
          'UPDATE subject_progress SET completed_dpps = ?, questions_count = GREATEST(0, questions_count - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [value, questionsToRemove, id]
        );
      } else {
        await connection.execute(
          'UPDATE subject_progress SET completed_dpps = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [value, id]
        );
      }
    } else {
      // Validate field name to prevent SQL injection
      const allowedFields = ['total_lectures', 'completed_lectures', 'total_dpps', 'completed_dpps', 'revisions', 'questions_count'];
      if (!allowedFields.includes(field)) {
        releaseConnection(connection);
        return NextResponse.json({ error: 'Invalid field name' }, { status: 400 });
      }
      
      await connection.execute(
        `UPDATE subject_progress SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [value, id]
      );
    }
    
    // Track analytics for subject progress
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subject_progress',
          data: { subject: field, progress_change: value }
        })
      });
    } catch (e) {
      // Analytics tracking is optional
    }
    
    releaseConnection(connection);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}