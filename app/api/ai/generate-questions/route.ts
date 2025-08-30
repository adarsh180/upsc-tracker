import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { topic, count = 5, difficulty = 'mixed' } = await request.json();
    
    const topicMap: { [key: string]: string } = {
      'current-affairs': 'Current Affairs and Recent Developments',
      'polity': 'Indian Polity and Governance',
      'geography': 'Indian and World Geography',
      'history': 'Indian History and Culture',
      'economics': 'Indian Economy and Economic Development',
      'environment': 'Environment and Ecology'
    };
    
    const topicName = topicMap[topic] || 'General Studies';
    
    const prompt = `Generate ${count} multiple choice questions for UPSC CSE Prelims on the topic: ${topicName}.

Requirements:
- Each question should have 4 options (A, B, C, D)
- Include detailed explanations for correct answers
- Mix of difficulty levels: ${difficulty}
- Questions should be factual and exam-relevant
- Avoid outdated information

Format the response as a JSON array:
[
  {
    "id": "1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this is correct",
    "difficulty": "easy|medium|hard",
    "topic": "${topicName}"
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert UPSC CSE question generator. Create high-quality, exam-relevant multiple choice questions with accurate information and detailed explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const questions = JSON.parse(response);
      return NextResponse.json({ questions });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

  } catch (error) {
    console.error('Question generation error:', error);
    
    // Fallback questions
    const fallbackQuestions = [
      {
        id: "1",
        question: "Which of the following is the constitutional body responsible for conducting elections in India?",
        options: [
          "Election Commission of India",
          "Central Election Committee", 
          "National Election Board",
          "Supreme Court of India"
        ],
        correctAnswer: 0,
        explanation: "The Election Commission of India is a constitutional body established under Article 324 of the Indian Constitution to conduct free and fair elections.",
        difficulty: "easy",
        topic: "Indian Polity"
      },
      {
        id: "2", 
        question: "The term 'Blue Revolution' in India is related to:",
        options: [
          "Milk production",
          "Fish production",
          "Wheat production", 
          "Cotton production"
        ],
        correctAnswer: 1,
        explanation: "Blue Revolution refers to the significant increase in fish production in India through scientific methods and modern technology.",
        difficulty: "medium",
        topic: "Indian Economy"
      }
    ];
    
    return NextResponse.json({ questions: fallbackQuestions });
  }
}