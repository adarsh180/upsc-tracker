import { NextRequest, NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length < 100) {
      return NextResponse.json({ 
        error: 'Text must be at least 100 characters long' 
      }, { status: 400 });
    }

    const prompt = `STRICTLY create UPSC questions ONLY from the content provided below. DO NOT add external information.

TEXT CONTENT:
${text}

CREATE QUESTIONS ONLY FROM THIS TEXT. Use facts, concepts, and information EXCLUSIVELY from the provided content.

Return JSON format:
{
  "questions": [
    {
      "question": "Question based ONLY on the provided text content",
      "options": ["A) Option from text", "B) Option from text", "C) Option from text", "D) Option from text"],
      "correct_answer": "A",
      "explanation": "Explanation using ONLY information from the provided text",
      "difficulty": "medium",
      "subject": "Subject based on text content"
    }
  ]
}

RULES:
1. Use ONLY facts and information present in the given text
2. Do NOT add external knowledge or information
3. Questions must be answerable from the text alone
4. Create 3-5 questions maximum
5. Focus on key concepts mentioned in the text
6. Test understanding of the specific content provided`;

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
            content: 'You are a UPSC question generator. Create questions STRICTLY from the provided text content ONLY. Do not use external knowledge. Questions must be answerable from the given text alone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
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
      // Fallback questions if JSON parsing fails
      questionsData = {
        questions: [{
          question: "Based on the provided text content, which of the following can be inferred?",
          options: [
            "A) The text contains specific factual information",
            "B) The content is relevant for UPSC preparation", 
            "C) Key concepts are discussed in the text",
            "D) All of the above"
          ],
          correct_answer: "D",
          explanation: "The provided text contains specific information that can be used to create targeted questions for UPSC preparation.",
          difficulty: "medium",
          subject: "Text Analysis"
        }]
      };
    }

    // Save generated questions to database
    const connection = await getConnection();
    const savedQuestions = [];
    
    for (const q of questionsData.questions) {
      const [result] = await connection.execute(
        `INSERT INTO questions (subject, question, options, correct_answer, explanation, difficulty, type, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          q.subject || 'General Studies',
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation,
          q.difficulty,
          'prelims'
        ]
      );
      
      savedQuestions.push({
        id: (result as any).insertId,
        ...q
      });
    }
    
    releaseConnection(connection);
    
    return NextResponse.json({ 
      success: true, 
      questions: savedQuestions,
      message: `Generated ${savedQuestions.length} UPSC questions from your text`
    });
    
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}