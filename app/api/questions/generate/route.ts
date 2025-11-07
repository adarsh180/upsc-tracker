import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { articleId, subject = 'Current Affairs' } = await request.json();
    
    const connection = await getConnection();
    
    // Get article content
    const [articles] = await connection.execute(
      'SELECT * FROM current_affairs WHERE id = ?',
      [articleId]
    );
    
    if (!Array.isArray(articles) || articles.length === 0) {
      releaseConnection(connection);
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const article = articles[0] as any;
    
    // Generate questions using Groq AI
    const prompt = `Based on this current affairs article, create 3 high-level UPSC CSE standard questions:

Title: ${article.title}
Content: ${article.content}
Category: ${article.category}

Generate questions in this exact JSON format:
{
  "questions": [
    {
      "question": "Multi-statement question with 4 statements",
      "options": ["A) Only 1 and 2", "B) Only 2 and 3", "C) Only 1 and 3", "D) All of the above"],
      "correct_answer": "A",
      "explanation": "Detailed explanation with reasoning",
      "difficulty": "hard",
      "type": "prelims"
    }
  ]
}

Requirements:
1. Questions should be UPSC CSE Prelims standard with multi-statement format
2. Include complex analytical questions testing understanding, not just facts
3. Cover constitutional, governance, economic, and international relations angles where relevant
4. Each question should have 4 statements to evaluate
5. Explanations should be comprehensive with UPSC-style reasoning
6. Difficulty should be "hard" for challenging questions
7. Focus on application and analysis, not just recall`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UPSC CSE question setter. Create high-quality, analytical questions that test deep understanding and application of concepts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0]?.message?.content;
    
    let questionsData;
    try {
      questionsData = JSON.parse(generatedContent);
    } catch (e) {
      // Fallback if JSON parsing fails
      questionsData = {
        questions: [{
          question: `Analyze the implications of "${article.title}" in the context of Indian governance and policy framework.`,
          options: [
            "A) It primarily affects economic policy and fiscal management",
            "B) It has significant constitutional and legal ramifications", 
            "C) It impacts both economic and constitutional aspects",
            "D) It is limited to administrative changes only"
          ],
          correct_answer: "C",
          explanation: "This development has multi-dimensional impacts affecting both economic policy frameworks and constitutional governance structures, requiring comprehensive analysis from multiple perspectives.",
          difficulty: "hard",
          type: "prelims"
        }]
      };
    }

    // Save generated questions to database
    const savedQuestions = [];
    for (const q of questionsData.questions) {
      const [result] = await connection.execute(
        `INSERT INTO questions (subject, question, options, correct_answer, explanation, difficulty, type, source_article_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          subject,
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation,
          q.difficulty,
          q.type,
          articleId
        ]
      );
      
      savedQuestions.push({
        id: (result as any).insertId,
        ...q,
        subject,
        source_article_id: articleId
      });
    }
    
    releaseConnection(connection);
    
    return NextResponse.json({ 
      success: true, 
      questions: savedQuestions,
      message: `Generated ${savedQuestions.length} high-level UPSC questions from current affairs`
    });
    
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}