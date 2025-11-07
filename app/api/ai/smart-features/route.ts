import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { groq } from '@/lib/groq';

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { action, data } = body;

    connection = await getConnection();
    await initializeTables(connection);

    switch (action) {
      case 'generate_notes':
        return await generateSmartNotes(connection, data);
      case 'evaluate_answer':
        return await evaluateAnswer(connection, data);
      case 'chat_query':
        return await handleChatQuery(connection, data);
      case 'predict_performance':
        return await predictPerformance(connection, data);
      case 'get_revision_schedule':
        return await getRevisionSchedule(connection, data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Smart features error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

async function initializeTables(connection: any) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS smart_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      subject VARCHAR(200),
      topic VARCHAR(300),
      content TEXT,
      difficulty_level ENUM('basic', 'intermediate', 'advanced') DEFAULT 'intermediate',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS answer_evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      question TEXT,
      answer TEXT,
      score DECIMAL(3,1),
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      query TEXT,
      response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

async function generateSmartNotes(connection: any, data: any) {
  const { subject, topic } = data;

  const [progress] = await connection.execute(
    'SELECT * FROM subject_progress WHERE subject = ? AND user_id = 1',
    [subject]
  );

  const userProgress = Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
  const completionRate = userProgress ? 
    (userProgress.completed_lectures / Math.max(userProgress.total_lectures, 1)) * 100 : 0;

  const difficulty = completionRate < 30 ? 'basic' : completionRate < 70 ? 'intermediate' : 'advanced';

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Create concise UPSC study notes with key concepts, facts, and practice questions.' },
        { role: 'user', content: `Subject: ${subject}, Topic: ${topic}, Level: ${difficulty}` }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 800,
    });

    const notes = completion.choices[0]?.message?.content || `# ${topic}\n\n## Key Points\n- Important concept 1\n- Important concept 2\n\n## Practice Questions\n1. Sample question`;

    await connection.execute(
      'INSERT INTO smart_notes (subject, topic, content, difficulty_level) VALUES (?, ?, ?, ?)',
      [subject, topic, notes, difficulty]
    );

    return NextResponse.json({ success: true, notes, difficulty, progress: completionRate });
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      notes: `# ${topic}\n\n## Key Points\n- Core concept 1\n- Core concept 2\n\n## UPSC Relevance\nImportant for ${subject}`,
      difficulty, 
      progress: completionRate 
    });
  }
}

async function evaluateAnswer(connection: any, data: any) {
  const { question, answer } = data;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Evaluate UPSC answer with score (1-10) and feedback.' },
        { role: 'user', content: `Question: ${question}\nAnswer: ${answer}` }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.4,
      max_tokens: 600,
    });

    const evaluation = completion.choices[0]?.message?.content || '';
    const scoreMatch = evaluation.match(/(\d+(?:\.\d+)?)/);
    const score = scoreMatch ? Math.min(10, parseFloat(scoreMatch[1])) : 6.5;

    await connection.execute(
      'INSERT INTO answer_evaluations (question, answer, score, feedback) VALUES (?, ?, ?, ?)',
      [question, answer, score, evaluation]
    );

    return NextResponse.json({ success: true, score, feedback: evaluation });
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      score: 6.5, 
      feedback: 'Good attempt. Add more examples and improve structure for better scores.' 
    });
  }
}

async function handleChatQuery(connection: any, data: any) {
  const { query } = data;

  const [subjects] = await connection.execute(
    'SELECT subject, completed_lectures, total_lectures FROM subject_progress WHERE user_id = 1'
  );

  const context = Array.isArray(subjects) ? subjects.map((s: any) => 
    `${s.subject}: ${Math.round((s.completed_lectures/s.total_lectures)*100)}%`
  ).join(', ') : '';

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `UPSC mentor. Student progress: ${context}` },
        { role: 'user', content: query }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.6,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'I can help with your UPSC preparation. Ask specific questions.';

    await connection.execute(
      'INSERT INTO ai_chat_history (query, response) VALUES (?, ?)',
      [query, response]
    );

    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      response: 'I can help with UPSC preparation. Ask about subjects, strategies, or exam tips.' 
    });
  }
}

async function predictPerformance(connection: any, data: any) {
  const [subjects] = await connection.execute('SELECT * FROM subject_progress WHERE user_id = 1');
  const [tests] = await connection.execute('SELECT * FROM test_records WHERE user_id = 1 LIMIT 10');

  const subjectsArray = Array.isArray(subjects) ? subjects : [];
  const testsArray = Array.isArray(tests) ? tests : [];

  const avgCompletion = subjectsArray.reduce((sum: number, s: any) => 
    sum + ((s.completed_lectures / Math.max(s.total_lectures, 1)) * 100), 0
  ) / Math.max(subjectsArray.length, 1);

  const avgTestScore = testsArray.reduce((sum: number, t: any) => 
    sum + ((t.scored_marks / Math.max(t.total_marks, 1)) * 100), 0
  ) / Math.max(testsArray.length, 1);

  const prelimsScore = Math.min(200, Math.max(50, (avgCompletion * 0.6) + (avgTestScore * 0.4)));
  const confidence = Math.min(95, Math.max(60, subjectsArray.length * 15));

  return NextResponse.json({
    success: true,
    prediction: {
      predicted_score: prelimsScore,
      confidence_level: confidence,
      key_factors: [`Completion: ${avgCompletion.toFixed(1)}%`, `Test avg: ${avgTestScore.toFixed(1)}%`],
      recommendations: [
        avgCompletion < 70 ? 'Complete more lectures' : 'Good progress',
        avgTestScore < 60 ? 'Practice more tests' : 'Maintain test practice'
      ]
    }
  });
}

async function getRevisionSchedule(connection: any, data: any) {
  const [subjects] = await connection.execute('SELECT * FROM subject_progress WHERE user_id = 1');
  const subjectsArray = Array.isArray(subjects) ? subjects : [];
  
  const schedule = subjectsArray.slice(0, 5).map((subject: any, index: number) => {
    const completion = (subject.completed_lectures / Math.max(subject.total_lectures, 1)) * 100;
    const date = new Date();
    date.setDate(date.getDate() + (index * 2) + 1);
    
    return {
      subject: subject.subject,
      date: date.toISOString().split('T')[0],
      priority: completion < 50 ? 'High' : completion < 80 ? 'Medium' : 'Low',
      completion: completion.toFixed(1),
      focus_areas: completion < 30 ? 'Basic concepts' : 'Practice questions'
    };
  });

  return NextResponse.json({ success: true, schedule });
}