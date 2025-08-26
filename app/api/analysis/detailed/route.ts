import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Ensure mood_entries table exists with all mood types
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        mood ENUM('happy', 'excited', 'motivated', 'confident', 'neutral', 'tired', 'stressed', 'frustrated', 'sad', 'anxious', 'overwhelmed', 'bored') NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);

    // Add questions_solved column to daily_goals if it doesn't exist
    await connection.execute(`
      ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS questions_solved INT DEFAULT 0
    `);

    // Get comprehensive data
    const [goals] = await connection.execute(`
      SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC
    `);
    
    const [moods] = await connection.execute(`
      SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC
    `);

    const [tests] = await connection.execute(`
      SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC
    `);

    await connection.end();

    const goalsArray = Array.isArray(goals) ? goals as any[] : [];
    const moodsArray = Array.isArray(moods) ? moods as any[] : [];
    const testsArray = Array.isArray(tests) ? tests as any[] : [];

    // Calculate totals
    const totalHours = goalsArray.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0);
    const totalQuestions = goalsArray.reduce((sum, g) => sum + parseInt(g.questions_solved || 0), 0) + 
                          testsArray.reduce((sum, t) => sum + parseInt(t.total_marks || 0), 0);

    // Calculate mood percentage
    const moodValues = {
      'happy': 100, 'excited': 95, 'motivated': 90, 'confident': 85,
      'neutral': 50, 'tired': 40, 'stressed': 30, 'frustrated': 25,
      'sad': 20, 'anxious': 15, 'overwhelmed': 10, 'bored': 35
    };
    
    const avgMoodPercent = moodsArray.length > 0 ? 
      moodsArray.reduce((sum, m) => sum + (moodValues[m.mood as keyof typeof moodValues] || 50), 0) / moodsArray.length : 50;

    // Generate weekly data
    const weeklyData = generateWeeklyData(goalsArray, moodsArray);
    
    // Generate monthly data
    const monthlyData = generateMonthlyData(goalsArray, moodsArray);
    
    // Generate lifetime data
    const lifetimeData = {
      period: 'Lifetime',
      hours: totalHours,
      questions: totalQuestions,
      moodPercent: avgMoodPercent
    };

    // Generate mood distribution
    const moodDistribution = generateMoodDistribution(moodsArray);

    // Generate AI mood insights
    const moodInsights = await generateMoodInsights(moodsArray, goalsArray);

    return NextResponse.json({
      totalQuestions,
      totalHours,
      avgMoodPercent: Math.round(avgMoodPercent),
      weeklyData,
      monthlyData,
      lifetimeData,
      moodInsights,
      moodDistribution
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json({
      totalQuestions: 0,
      totalHours: 0,
      avgMoodPercent: 50,
      weeklyData: [],
      monthlyData: [],
      lifetimeData: { period: 'Lifetime', hours: 0, questions: 0, moodPercent: 50 },
      moodInsights: 'Unable to generate insights at the moment.',
      moodDistribution: []
    });
  }
}

function generateWeeklyData(goals: any[], moods: any[]) {
  const weeklyMap = new Map();
  
  // Process goals data
  goals.forEach(goal => {
    const date = new Date(goal.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        period: `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        hours: 0,
        questions: 0,
        moodPercent: 0,
        moodCount: 0
      });
    }
    
    const week = weeklyMap.get(weekKey);
    week.hours += parseFloat(goal.hours_studied || 0);
    week.questions += parseInt(goal.questions_solved || 0);
  });

  // Process mood data
  const moodValues = {
    'happy': 100, 'excited': 95, 'motivated': 90, 'confident': 85,
    'neutral': 50, 'tired': 40, 'stressed': 30, 'frustrated': 25,
    'sad': 20, 'anxious': 15, 'overwhelmed': 10, 'bored': 35
  };

  moods.forEach(mood => {
    const date = new Date(mood.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (weeklyMap.has(weekKey)) {
      const week = weeklyMap.get(weekKey);
      week.moodPercent += moodValues[mood.mood as keyof typeof moodValues] || 50;
      week.moodCount += 1;
    }
  });

  // Calculate averages and return last 12 weeks in chronological order
  return Array.from(weeklyMap.values())
    .map(week => ({
      ...week,
      moodPercent: week.moodCount > 0 ? Math.round(week.moodPercent / week.moodCount) : 50
    }))
    .slice(-12)
    .sort((a, b) => a.period.localeCompare(b.period));
}

function generateMonthlyData(goals: any[], moods: any[]) {
  const monthlyMap = new Map();
  
  // Process goals data
  goals.forEach(goal => {
    const date = new Date(goal.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        hours: 0,
        questions: 0,
        moodPercent: 0,
        moodCount: 0
      });
    }
    
    const month = monthlyMap.get(monthKey);
    month.hours += parseFloat(goal.hours_studied || 0);
    month.questions += parseInt(goal.questions_solved || 0);
  });

  // Process mood data
  const moodValues = {
    'happy': 100, 'excited': 95, 'motivated': 90, 'confident': 85,
    'neutral': 50, 'tired': 40, 'stressed': 30, 'frustrated': 25,
    'sad': 20, 'anxious': 15, 'overwhelmed': 10, 'bored': 35
  };

  moods.forEach(mood => {
    const date = new Date(mood.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyMap.has(monthKey)) {
      const month = monthlyMap.get(monthKey);
      month.moodPercent += moodValues[mood.mood as keyof typeof moodValues] || 50;
      month.moodCount += 1;
    }
  });

  // Calculate averages and return last 12 months in chronological order
  return Array.from(monthlyMap.values())
    .map(month => ({
      ...month,
      moodPercent: month.moodCount > 0 ? Math.round(month.moodPercent / month.moodCount) : 50
    }))
    .slice(-12)
    .sort((a, b) => a.period.localeCompare(b.period));
}

function generateMoodDistribution(moods: any[]) {
  const distribution = moods.reduce((acc, mood) => {
    acc[mood.mood] = (acc[mood.mood] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(distribution).map(([mood, count]) => ({
    mood,
    count
  }));
}

async function generateMoodInsights(moods: any[], goals: any[]) {
  try {
    const recentMoods = moods.slice(0, 30).map(m => m.mood).join(', ');
    const avgStudyHours = goals.length > 0 ? goals.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0) / goals.length : 0;
    
    const prompt = `Analyze mood patterns and study correlation: Recent moods: ${recentMoods}. Average study hours: ${avgStudyHours.toFixed(1)}h. Provide insights on mood-study relationship and recommendations for UPSC preparation. Keep response under 150 words.`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || 'Your mood patterns show a strong correlation with study performance. Maintain positive emotions through regular breaks and balanced preparation.';
  } catch (error) {
    return 'Your mood patterns indicate the importance of maintaining emotional well-being during UPSC preparation. Consider incorporating stress management techniques and regular breaks to optimize your study performance.';
  }
}