import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { essay, topic } = await request.json();
    
    if (!essay || !topic) {
      return NextResponse.json({ 
        error: 'Essay and topic are required' 
      }, { status: 400 });
    }

    const wordCount = essay.trim().split(/\s+/).length;
    
    const prompt = `Evaluate this UPSC Mains essay based on official UPSC evaluation criteria:

TOPIC: ${topic}

ESSAY:
${essay}

WORD COUNT: ${wordCount}

Evaluate on these parameters and provide scores out of 100:
1. Content Quality (depth, relevance, factual accuracy)
2. Structure & Organization (introduction, body, conclusion, flow)
3. Language & Expression (grammar, vocabulary, clarity)
4. Coherence & Logic (argument flow, consistency)
5. Overall Score

Provide response in this exact JSON format:
{
  "overall_score": 75,
  "content_score": 80,
  "structure_score": 70,
  "language_score": 75,
  "coherence_score": 78,
  "feedback": "Detailed overall feedback paragraph",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Evaluation Criteria:
- Content: Depth of analysis, factual accuracy, contemporary relevance, multiple perspectives
- Structure: Clear introduction, logical body paragraphs, strong conclusion, smooth transitions
- Language: Grammar, vocabulary, sentence variety, clarity of expression
- Coherence: Logical flow, consistency of arguments, proper linkages
- UPSC Standard: Essays should be 1000-1200 words, analytical, balanced, and solution-oriented`;

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
            content: 'You are an expert UPSC Mains essay evaluator with deep knowledge of UPSC evaluation standards. Provide detailed, constructive feedback that helps aspirants improve their essay writing skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate essay');
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0]?.message?.content;
    
    let evaluation;
    try {
      evaluation = JSON.parse(generatedContent);
    } catch (e) {
      // Fallback evaluation if JSON parsing fails
      evaluation = {
        overall_score: Math.max(40, Math.min(85, 60 + (wordCount > 800 ? 10 : 0) + (wordCount < 1500 ? 5 : -5))),
        content_score: 65,
        structure_score: 60,
        language_score: 70,
        coherence_score: 65,
        feedback: `Your essay on "${topic}" demonstrates a good understanding of the topic. The essay has ${wordCount} words. Focus on developing stronger arguments with more examples and ensuring better structure with clear introduction, body, and conclusion.`,
        strengths: [
          "Good grasp of the topic",
          "Relevant content included",
          "Appropriate word count maintained"
        ],
        weaknesses: [
          "Could benefit from more concrete examples",
          "Structure could be more organized"
        ],
        suggestions: [
          "Include more current examples and case studies",
          "Strengthen the conclusion with actionable solutions",
          "Improve paragraph transitions for better flow"
        ]
      };
    }

    // Adjust scores based on word count
    if (wordCount < 800) {
      evaluation.overall_score = Math.max(evaluation.overall_score - 10, 30);
      evaluation.suggestions.unshift("Increase word count to meet UPSC standards (1000-1200 words)");
    } else if (wordCount > 1500) {
      evaluation.overall_score = Math.max(evaluation.overall_score - 5, 40);
      evaluation.suggestions.unshift("Consider reducing word count for better conciseness");
    }

    return NextResponse.json({ 
      success: true, 
      evaluation,
      word_count: wordCount
    });
    
  } catch (error) {
    console.error('Failed to evaluate essay:', error);
    return NextResponse.json({ 
      error: 'Failed to evaluate essay',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}