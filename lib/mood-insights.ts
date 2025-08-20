import Groq from 'groq-sdk';

export async function generateMoodInsight(moodData: any[]) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an empathetic AI assistant that analyzes mood patterns and provides helpful insights."
        },
        {
          role: "user",
          content: `Analyze these mood entries and provide insights about patterns, trends, and suggestions for improvement: ${JSON.stringify(moodData)}`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || "No insights available.";
  } catch (error) {
    console.error('Groq API error:', error);
    return "Unable to generate mood insights at this time.";
  }
}
