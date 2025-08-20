import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export { groq };

export async function getPersonalizedInsights(progressData: any) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert UPSC CSE mentor. Analyze the student's progress data and provide personalized insights, recommendations, and performance feedback in a concise, actionable format."
        },
        {
          role: "user",
          content: `Analyze UPSC progress: ${progressData.length} subjects, avg completion: ${Math.round(progressData.reduce((sum: number, s: any) => sum + ((s.completed_lectures / s.total_lectures) * 100), 0) / progressData.length)}%`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || "Unable to generate insights at the moment.";
  } catch (error) {
    console.error('Groq API error:', error);
    return "AI insights temporarily unavailable.";
  }
}

export async function getSubjectAnalysis(subjectData: any) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a UPSC subject expert. Provide specific recommendations for improvement based on the subject progress data."
        },
        {
          role: "user",
          content: `Subject: ${subjectData.subject}, Lectures: ${subjectData.completed_lectures}/${subjectData.total_lectures}, DPPs: ${subjectData.completed_dpps}/${subjectData.total_dpps}`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || "Analysis unavailable.";
  } catch (error) {
    console.error('Groq API error:', error);
    return "Subject analysis temporarily unavailable.";
  }
}