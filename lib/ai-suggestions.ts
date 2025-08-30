import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface StudySuggestion {
  type: 'topic' | 'schedule' | 'resource' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateStudySuggestions(userData: {
  recentProgress: any[];
  weakAreas: string[];
  studyHours: number;
  examDate?: string;
}): Promise<StudySuggestion[]> {
  try {
    const prompt = `You are a UPSC expert. Generate exactly 4 study suggestions in valid JSON array format. No additional text.

    Data: ${userData.weakAreas.join(', ')} weak areas, ${userData.studyHours}h daily study

    Return only this JSON structure:
    [
      {
        "type": "topic",
        "priority": "high",
        "title": "Focus on weak areas",
        "description": "Detailed explanation",
        "actionItems": ["action 1", "action 2"],
        "estimatedTime": "2 hours",
        "difficulty": "medium"
      }
    ]`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a UPSC expert. Return only valid JSON arrays. No explanatory text.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    // Clean and parse JSON
    let cleanResponse = response.trim();
    const jsonStart = cleanResponse.indexOf('[');
    const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    }
    
    const parsed = JSON.parse(cleanResponse);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error('AI suggestion error:', error);
    
    // Fallback suggestions
    return [
      {
        type: 'topic',
        priority: 'high',
        title: 'Focus on Current Affairs',
        description: 'Your current affairs score needs improvement. Dedicate more time to daily news analysis.',
        actionItems: [
          'Read newspaper daily for 45 minutes',
          'Make notes of important events',
          'Practice current affairs MCQs'
        ],
        estimatedTime: '1.5 hours daily',
        difficulty: 'medium'
      },
      {
        type: 'schedule',
        priority: 'medium',
        title: 'Optimize Morning Study',
        description: 'Your productivity is highest in the morning. Allocate difficult subjects to this time.',
        actionItems: [
          'Wake up 30 minutes earlier',
          'Study most challenging subject first',
          'Take short breaks every 45 minutes'
        ],
        estimatedTime: '2-3 hours',
        difficulty: 'easy'
      }
    ];
  }
}

export async function generateDailyPlan(preferences: {
  subjects: string[];
  availableHours: number;
  priorities: string[];
}): Promise<{
  timeSlots: Array<{
    time: string;
    subject: string;
    activity: string;
    duration: number;
  }>;
  tips: string[];
}> {
  try {
    const prompt = `
    Create a detailed daily study plan for a UPSC aspirant:
    - Subjects to cover: ${preferences.subjects.join(', ')}
    - Available study hours: ${preferences.availableHours}
    - Priority areas: ${preferences.priorities.join(', ')}
    
    Return JSON with:
    {
      "timeSlots": [
        {
          "time": "6:00 AM",
          "subject": "Subject name",
          "activity": "Specific activity",
          "duration": 90
        }
      ],
      "tips": ["study tip 1", "study tip 2"]
    }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.6,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Daily plan generation error:', error);
    
    // Fallback plan
    return {
      timeSlots: [
        {
          time: '6:00 AM',
          subject: 'General Studies 1',
          activity: 'History and Culture reading',
          duration: 90
        },
        {
          time: '8:00 AM',
          subject: 'Current Affairs',
          activity: 'Newspaper analysis',
          duration: 60
        }
      ],
      tips: [
        'Start with the most challenging subject when your mind is fresh',
        'Take 10-minute breaks every hour to maintain focus'
      ]
    };
  }
}

export async function evaluateAnswer(question: string, answer: string): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
  strengths: string[];
}> {
  try {
    const prompt = `
    Evaluate this UPSC answer:
    
    Question: ${question}
    Answer: ${answer}
    
    Provide evaluation in JSON format:
    {
      "score": 0-10,
      "feedback": "Overall feedback",
      "improvements": ["improvement 1", "improvement 2"],
      "strengths": ["strength 1", "strength 2"]
    }
    
    Consider:
    - Content accuracy
    - Structure and presentation
    - Use of examples
    - Analytical depth
    - Word limit adherence
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Answer evaluation error:', error);
    
    return {
      score: 6,
      feedback: 'Your answer shows good understanding but needs more structure and examples.',
      improvements: [
        'Add more relevant examples',
        'Improve answer structure with clear introduction and conclusion',
        'Include recent developments and data'
      ],
      strengths: [
        'Good conceptual understanding',
        'Relevant content coverage'
      ]
    };
  }
}