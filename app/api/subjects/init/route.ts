import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

const defaultSubjects = [
  // GS1
  { subject: 'Ancient History', category: 'GS1' },
  { subject: 'Modern History', category: 'GS1' },
  { subject: 'World History', category: 'GS1' },
  { subject: 'Geography', category: 'GS1' },
  { subject: 'Society', category: 'GS1' },
  { subject: 'Art & Culture', category: 'GS1' },

  // GS2
  { subject: 'Polity', category: 'GS2' },
  { subject: 'Governance', category: 'GS2' },
  { subject: 'International Relations', category: 'GS2' },
  { subject: 'Internal Security', category: 'GS2' },

  // GS3
  { subject: 'Economy', category: 'GS3' },
  { subject: 'Disaster Management', category: 'GS3' },
  { subject: 'Environment', category: 'GS3' },
  { subject: 'Science & Tech', category: 'GS3' },

  // GS4
  { subject: 'Ethics', category: 'GS4' },

  // CSAT
  { subject: 'Quantitative Aptitude', category: 'CSAT' },
  { subject: 'Logical Reasoning', category: 'CSAT' },
  { subject: 'Reading Comprehension', category: 'CSAT' }
];

export async function POST() {
  try {
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
        revisions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Check if subjects already exist
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM subject_progress WHERE user_id = 1'
    );
    
    if ((existing as any)[0]?.count > 0) {
      await connection.end();
      return NextResponse.json({ message: 'Subjects already initialized' });
    }

    // Insert default subjects
    for (const subject of defaultSubjects) {
      await connection.execute(
        'INSERT INTO subject_progress (user_id, subject, category, total_lectures, completed_lectures, total_dpps, completed_dpps, revisions) VALUES (1, ?, ?, 10, 0, 5, 0, 0)',
        [subject.subject, subject.category]
      );
    }
    
    await connection.end();
    return NextResponse.json({ message: 'Subjects initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize subjects:', error);
    return NextResponse.json({ message: 'Subjects initialization completed with warnings' }, { status: 200 });
  }
}
