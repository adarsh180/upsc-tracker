import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Create questions table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(100),
        topic VARCHAR(100),
        question TEXT,
        options JSON,
        correct_answer VARCHAR(10),
        explanation TEXT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        year INT DEFAULT 2024,
        exam_type ENUM('prelims', 'mains') DEFAULT 'prelims',
        type VARCHAR(50) DEFAULT 'prelims',
        source_article_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert high-level UPSC questions if table is empty
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM questions');
    const count = (existing as any[])[0].count;
    
    if (count === 0) {
      const highLevelQuestions = [
        {
          subject: 'Polity & Governance',
          topic: 'Constitutional Provisions',
          question: 'Consider the following statements about the recent amendments to the Information Technology Rules, 2021:\n1. Social media platforms are required to appoint a Chief Compliance Officer\n2. Intermediaries must enable identification of the first originator of information\n3. The rules apply only to platforms with more than 50 lakh users\n4. Non-compliance can result in loss of safe harbor protection',
          options: JSON.stringify(['Only 1, 2 and 4', 'Only 1, 3 and 4', 'Only 2 and 3', 'All of the above']),
          correct_answer: 'A',
          explanation: 'The IT Rules 2021 require significant social media intermediaries (5 million+ users) to appoint compliance officers, enable traceability of messages, and can lose safe harbor protection for non-compliance. The threshold is 50 lakh (5 million), making statements 1, 2, and 4 correct.',
          difficulty: 'hard',
          year: 2024,
          exam_type: 'prelims'
        },
        {
          subject: 'Economics',
          topic: 'Government Schemes',
          question: 'Analyze the following statements regarding India\'s Production Linked Incentive (PLI) scheme:\n1. The scheme covers 14 key sectors including electronics and pharmaceuticals\n2. It aims to boost domestic manufacturing and reduce import dependence\n3. Incentives are provided based on incremental sales over a base year\n4. The total outlay exceeds ₹2 lakh crore over five years',
          options: JSON.stringify(['Only 1, 2 and 3', 'Only 2, 3 and 4', 'Only 1, 3 and 4', 'All of the above']),
          correct_answer: 'D',
          explanation: 'The PLI scheme covers 14 key sectors, aims to boost manufacturing and reduce imports, provides incentives on incremental sales, and has an outlay of approximately ₹1.97 lakh crore over five years, making all statements correct.',
          difficulty: 'hard',
          year: 2024,
          exam_type: 'prelims'
        },
        {
          subject: 'Environment & Current Affairs',
          topic: 'Climate Policy',
          question: 'Consider the following about India\'s climate commitments and recent initiatives:\n1. India committed to net-zero emissions by 2070 at COP26\n2. The country aims for 500 GW renewable energy capacity by 2030\n3. India launched the Global Biofuels Alliance during its G20 presidency\n4. The Loss and Damage Fund was operationalized with India\'s support at COP28',
          options: JSON.stringify(['Only 1, 2 and 3', 'Only 1, 3 and 4', 'Only 2, 3 and 4', 'All of the above']),
          correct_answer: 'D',
          explanation: 'India reaffirmed its net-zero by 2070 commitment at COP26, targets 500 GW renewable capacity by 2030, launched the Global Biofuels Alliance during its G20 presidency, and supported the operationalization of the Loss and Damage Fund at COP28.',
          difficulty: 'hard',
          year: 2024,
          exam_type: 'prelims'
        },
        {
          subject: 'International Relations',
          topic: 'Bilateral Relations',
          question: 'Evaluate the following statements about India\'s recent diplomatic initiatives:\n1. The India-Middle East-Europe Economic Corridor was announced at the G20 Summit\n2. India became a permanent member of the Shanghai Cooperation Organization\n3. The Quad partnership includes India, USA, Japan, and Australia\n4. India chairs the Global Partnership on AI (GPAI) for 2024',
          options: JSON.stringify(['Only 1, 3 and 4', 'Only 1, 2 and 3', 'Only 2, 3 and 4', 'All of the above']),
          correct_answer: 'A',
          explanation: 'The IMEC was announced at G20, Quad includes the mentioned countries, and India chairs GPAI for 2024. However, India is a member (not permanent member) of SCO since 2017, making statements 1, 3, and 4 correct.',
          difficulty: 'hard',
          year: 2024,
          exam_type: 'prelims'
        },
        {
          subject: 'Science & Technology',
          topic: 'Space Technology',
          question: 'Analyze the following statements about India\'s recent space achievements:\n1. Chandrayaan-3 successfully landed on the Moon\'s south pole region\n2. Aditya-L1 is India\'s first solar mission to study the Sun\n3. ISRO launched 36 satellites in a single mission for OneWeb\n4. India became the fourth country to achieve a soft landing on the Moon',
          options: JSON.stringify(['Only 1, 2 and 3', 'Only 1, 2 and 4', 'Only 2, 3 and 4', 'All of the above']),
          correct_answer: 'D',
          explanation: 'Chandrayaan-3 achieved a historic soft landing near the Moon\'s south pole, Aditya-L1 is indeed India\'s first solar mission, ISRO launched 36 OneWeb satellites, and India became the fourth country (after USSR, USA, China) to achieve lunar soft landing.',
          difficulty: 'hard',
          year: 2024,
          exam_type: 'prelims'
        }
      ];
      
      for (const q of highLevelQuestions) {
        await connection.execute(
          `INSERT INTO questions (subject, topic, question, options, correct_answer, explanation, difficulty, year, exam_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.subject, q.topic, q.question, q.options, q.correct_answer, q.explanation, q.difficulty, q.year, q.exam_type]
        );
      }
    }
    
    const [rows] = await connection.execute(
      'SELECT * FROM questions ORDER BY created_at DESC'
    );
    
    releaseConnection(connection);
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ data: [] });
  }
}