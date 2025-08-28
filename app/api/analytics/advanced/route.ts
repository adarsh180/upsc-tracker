import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();

    // Fetch all subjects data (GS1-4, CSAT, Optional, PSIR)
    const [subjectsRows] = await connection.execute(`
      SELECT category, subject, total_lectures, completed_lectures, total_dpps, completed_dpps, revisions
      FROM subject_progress
    `) as [any[], any];

    // Fetch daily goals data
    const [goalsRows] = await connection.execute(`
      SELECT date, subject, hours_studied, topics_covered, questions_solved
      FROM daily_goals
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      ORDER BY date DESC
    `) as [any[], any];

    // Fetch test records
    const [testsRows] = await connection.execute(`
      SELECT test_type, test_category, subject, total_marks, scored_marks, attempt_date
      FROM test_records
      WHERE attempt_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      ORDER BY attempt_date DESC
    `) as [any[], any];

    // Fetch current affairs progress
    const [currentAffairsRows] = await connection.execute(`
      SELECT total_topics, completed_topics, updated_at
      FROM current_affairs
      ORDER BY updated_at DESC
      LIMIT 1
    `) as [any[], any];

    // Fetch essay progress
    const [essayRows] = await connection.execute(`
      SELECT lectures_completed, essays_written, total_lectures, total_essays, updated_at
      FROM essay_progress
      ORDER BY updated_at DESC
      LIMIT 1
    `) as [any[], any];

    // Fetch optional progress (using correct column names)
    let optionalRows: any[] = [];
    try {
      const [rows] = await connection.execute(`
        SELECT section_1, section_2, section_3, section_4, test_checkboxes, updated_at
        FROM optional_progress
        ORDER BY updated_at DESC
        LIMIT 1
      `) as [any[], any];
      if (rows.length > 0) {
        const row = rows[0];
        optionalRows = [
          { section_name: 'Section 1', completed_checkboxes: row.section_1, total_checkboxes: 140 },
          { section_name: 'Section 2', completed_checkboxes: row.section_2, total_checkboxes: 140 },
          { section_name: 'Section 3', completed_checkboxes: row.section_3, total_checkboxes: 140 },
          { section_name: 'Section 4', completed_checkboxes: row.section_4, total_checkboxes: 140 },
          { section_name: 'Tests', completed_checkboxes: row.test_checkboxes, total_checkboxes: 500 }
        ];
      }
    } catch (e) {
      console.log('Optional progress table not found or empty');
    }

    // Fetch PSIR progress (using correct column names)
    let psirRows: any[] = [];
    try {
      const [rows] = await connection.execute(`
        SELECT section_1, section_2, section_3, section_4, lecture_checkboxes, test_checkboxes, updated_at
        FROM psir_progress
        ORDER BY updated_at DESC
        LIMIT 1
      `) as [any[], any];
      if (rows.length > 0) {
        const row = rows[0];
        psirRows = [
          { section_name: 'PSIR Section 1', completed_checkboxes: row.section_1, total_checkboxes: 150 },
          { section_name: 'PSIR Section 2', completed_checkboxes: row.section_2, total_checkboxes: 150 },
          { section_name: 'PSIR Section 3', completed_checkboxes: row.section_3, total_checkboxes: 150 },
          { section_name: 'PSIR Section 4', completed_checkboxes: row.section_4, total_checkboxes: 150 },
          { section_name: 'PSIR Lectures', completed_checkboxes: row.lecture_checkboxes, total_checkboxes: 250 },
          { section_name: 'PSIR Tests', completed_checkboxes: row.test_checkboxes, total_checkboxes: 500 }
        ];
      }
    } catch (e) {
      console.log('PSIR progress table not found or empty');
    }

    // Fetch mood entries
    let moodRows: any[] = [];
    try {
      const [rows] = await connection.execute(`
        SELECT mood, date
        FROM mood_entries
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY date DESC
      `) as [any[], any];
      moodRows = rows;
    } catch (e) {
      console.log('Mood entries table not found or empty');
    }

    await connection.end();

    // Calculate comprehensive analytics
    const analytics = calculateComprehensiveAnalytics({
      subjects: subjectsRows,
      goals: goalsRows,
      tests: testsRows,
      currentAffairs: currentAffairsRows[0] || { total_topics: 300, completed_topics: 0 },
      essay: essayRows[0] || { lectures_completed: 0, essays_written: 0, total_lectures: 50, total_essays: 100 },
      optional: optionalRows,
      psir: psirRows,
      moods: moodRows
    });

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Advanced analytics error:', error);
    try {
      await connection?.end();
    } catch (e) {}
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function calculateComprehensiveAnalytics(data: any) {
  const { subjects, goals, tests, currentAffairs, essay, optional, psir, moods } = data;

  // Calculate overall subject progress
  const totalSubjects = subjects.length;
  const subjectProgress = subjects.map((s: any) => {
    const lectureProgress = s.total_lectures > 0 ? (s.completed_lectures / s.total_lectures) * 100 : 0;
    const dppProgress = s.total_dpps > 0 ? (s.completed_dpps / s.total_dpps) * 100 : 0;
    const overallProgress = (lectureProgress + dppProgress) / 2;
    return {
      subject: s.subject,
      category: s.category,
      progress: Math.round(overallProgress),
      lectureProgress: Math.round(lectureProgress),
      dppProgress: Math.round(dppProgress)
    };
  });

  const avgSubjectProgress = subjectProgress.reduce((sum: number, s: any) => sum + s.progress, 0) / totalSubjects;

  // Calculate study consistency from goals
  const studyDays = new Set(goals.map((g: any) => {
    const dateStr = g.date instanceof Date ? g.date.toISOString() : String(g.date);
    return dateStr.split('T')[0];
  })).size;
  const totalDays = 90; // Last 90 days
  const consistency = Math.round((studyDays / totalDays) * 100);

  // Calculate total study hours
  const totalStudyHours = goals.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied), 0);
  const avgDailyHours = totalStudyHours / studyDays || 0;

  // Calculate test performance
  const totalTests = tests.length;
  const avgTestScore = tests.length > 0 
    ? tests.reduce((sum: number, t: any) => sum + (t.scored_marks / t.total_marks) * 100, 0) / tests.length
    : 0;

  // Calculate current affairs progress
  const currentAffairsProgress = currentAffairs.total_topics > 0 
    ? (currentAffairs.completed_topics / currentAffairs.total_topics) * 100 
    : 0;

  // Calculate essay progress
  const essayLectureProgress = essay.total_lectures > 0 
    ? (essay.lectures_completed / essay.total_lectures) * 100 
    : 0;
  const essayWritingProgress = essay.total_essays > 0 
    ? (essay.essays_written / essay.total_essays) * 100 
    : 0;

  // Calculate optional progress
  const optionalProgress = optional.length > 0 
    ? optional.reduce((sum: number, opt: any) => {
        const progress = opt.total_checkboxes > 0 ? (opt.completed_checkboxes / opt.total_checkboxes) * 100 : 0;
        return sum + progress;
      }, 0) / optional.length
    : 0;

  // Calculate PSIR progress
  const psirProgress = psir.length > 0 
    ? psir.reduce((sum: number, p: any) => {
        const progress = p.total_checkboxes > 0 ? (p.completed_checkboxes / p.total_checkboxes) * 100 : 0;
        return sum + progress;
      }, 0) / psir.length
    : 0;

  // Calculate mood analysis
  const moodAnalysis = analyzeMoods(moods);

  // Generate AI prediction based on all data
  const prediction = generateAIPrediction({
    avgSubjectProgress,
    consistency,
    avgTestScore,
    currentAffairsProgress,
    essayProgress: (essayLectureProgress + essayWritingProgress) / 2,
    optionalProgress,
    psirProgress,
    moodScore: moodAnalysis.averageScore,
    totalStudyHours,
    avgDailyHours
  });

  // Identify weak areas
  const weakAreas = identifyWeakAreas({
    subjects: subjectProgress,
    currentAffairsProgress,
    essayLectureProgress,
    essayWritingProgress,
    optionalProgress,
    psirProgress,
    consistency,
    avgTestScore
  });

  // Generate trend data for charts
  const trendData = generateTrendData(goals, tests);

  return {
    performancePrediction: prediction,
    existingData: {
      overallProgress: {
        totalSubjects,
        avgSubjectProgress: Math.round(avgSubjectProgress),
        totalStudyHours: Math.round(totalStudyHours),
        avgTestScore: Math.round(avgTestScore)
      },
      totalTests,
      currentAffairsProgress: Math.round(currentAffairsProgress),
      essayProgress: {
        lectures: Math.round(essayLectureProgress),
        writing: Math.round(essayWritingProgress)
      },
      optionalProgress: Math.round(optionalProgress),
      psirProgress: Math.round(psirProgress)
    },
    studyPatterns: {
      consistency,
      avgDailyHours: Math.round(avgDailyHours * 10) / 10
    },
    weakAreas,
    moodAnalysis,
    realTimeData: {
      trendData,
      subjectData: subjectProgress.slice(0, 6) // Top 6 for pie chart
    }
  };
}

function generateAIPrediction(metrics: any) {
  const {
    avgSubjectProgress,
    consistency,
    avgTestScore,
    currentAffairsProgress,
    essayProgress,
    optionalProgress,
    psirProgress,
    moodScore,
    totalStudyHours,
    avgDailyHours
  } = metrics;

  // Weighted scoring algorithm
  const weights = {
    subjectProgress: 0.18,
    consistency: 0.16,
    testScore: 0.16,
    optional: 0.13,
    psir: 0.12,
    currentAffairs: 0.10,
    essay: 0.10,
    mood: 0.03,
    studyHours: 0.02
  };

  const normalizedHours = Math.min(totalStudyHours / 500, 1) * 100; // Normalize to 500 hours target

  const weightedScore = 
    (avgSubjectProgress * weights.subjectProgress) +
    (consistency * weights.consistency) +
    (avgTestScore * weights.testScore) +
    (optionalProgress * weights.optional) +
    (psirProgress * weights.psir) +
    (currentAffairsProgress * weights.currentAffairs) +
    (essayProgress * weights.essay) +
    (moodScore * weights.mood) +
    (normalizedHours * weights.studyHours);

  const finalScore = Math.min(Math.max(Math.round(weightedScore), 0), 100);

  // Determine trend
  let trend = 'stable';
  if (consistency > 70 && avgDailyHours > 4) trend = 'improving';
  else if (consistency < 50 || avgDailyHours < 2) trend = 'declining';

  // Calculate confidence based on data completeness
  const dataCompleteness = [
    avgSubjectProgress > 0 ? 1 : 0,
    consistency > 0 ? 1 : 0,
    avgTestScore > 0 ? 1 : 0,
    optionalProgress > 0 ? 1 : 0,
    psirProgress > 0 ? 1 : 0,
    currentAffairsProgress > 0 ? 1 : 0,
    essayProgress > 0 ? 1 : 0,
    moodScore > 0 ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  const confidence = Math.round((dataCompleteness / 8) * 100);

  // Generate recommendations
  const recommendations = generateRecommendations(metrics);

  // Generate reasoning
  const reasoning = generateReasoning(metrics, finalScore);

  return {
    score: finalScore,
    trend,
    confidence,
    reasoning,
    recommendations
  };
}

function analyzeMoods(moods: any[]) {
  if (moods.length === 0) {
    return { averageScore: 50, distribution: {}, trend: 'neutral' };
  }

  const moodScores: { [key: string]: number } = {
    'excited': 90, 'confident': 85, 'motivated': 80, 'focused': 75,
    'calm': 70, 'neutral': 50, 'tired': 40, 'stressed': 30,
    'overwhelmed': 25, 'frustrated': 20, 'anxious': 15, 'burnt-out': 10
  };

  const totalScore = moods.reduce((sum, mood) => sum + (moodScores[mood.mood] || 50), 0);
  const averageScore = totalScore / moods.length;

  const distribution = moods.reduce((acc: any, mood) => {
    acc[mood.mood] = (acc[mood.mood] || 0) + 1;
    return acc;
  }, {});

  return { averageScore, distribution, trend: averageScore > 60 ? 'positive' : 'needs_attention' };
}

function identifyWeakAreas(data: any) {
  const { subjects, currentAffairsProgress, essayLectureProgress, essayWritingProgress, optionalProgress, psirProgress, consistency, avgTestScore } = data;
  const weakAreas = [];

  // Subject-wise weak areas
  subjects.forEach((subject: any) => {
    if (subject.progress < 30) {
      weakAreas.push({
        subject: subject.subject,
        category: subject.category,
        progress: subject.progress,
        priority: subject.progress < 15 ? 'high' : 'medium',
        reason: 'Low completion rate'
      });
    }
  });

  // Other weak areas
  if (currentAffairsProgress < 25) {
    weakAreas.push({
      subject: 'Current Affairs',
      category: 'Special',
      progress: Math.round(currentAffairsProgress),
      priority: 'high',
      reason: 'Critical for both Prelims and Mains'
    });
  }

  if (essayLectureProgress < 30) {
    weakAreas.push({
      subject: 'Essay Lectures',
      category: 'Essay',
      progress: Math.round(essayLectureProgress),
      priority: 'medium',
      reason: 'Foundation for essay writing'
    });
  }

  if (optionalProgress < 25) {
    weakAreas.push({
      subject: 'Optional Subject',
      category: 'Optional',
      progress: Math.round(optionalProgress),
      priority: 'high',
      reason: 'Optional subject crucial for Mains'
    });
  }

  if (psirProgress < 25) {
    weakAreas.push({
      subject: 'PSIR',
      category: 'Optional',
      progress: Math.round(psirProgress),
      priority: 'high',
      reason: 'PSIR optional subject needs attention'
    });
  }

  if (consistency < 50) {
    weakAreas.push({
      subject: 'Study Consistency',
      category: 'Habit',
      progress: consistency,
      priority: 'high',
      reason: 'Irregular study pattern detected'
    });
  }

  return weakAreas.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return a.progress - b.progress;
  });
}

function generateRecommendations(metrics: any) {
  const recommendations = [];
  const { avgSubjectProgress, consistency, avgTestScore, currentAffairsProgress, essayProgress, optionalProgress, psirProgress, avgDailyHours } = metrics;

  if (consistency < 70) {
    recommendations.push("Establish a consistent daily study routine. Aim for at least 6 days per week.");
  }

  if (avgDailyHours < 4) {
    recommendations.push("Increase daily study hours to 4-6 hours for optimal UPSC preparation.");
  }

  if (avgSubjectProgress < 40) {
    recommendations.push("Focus on completing basic lectures before moving to advanced topics.");
  }

  if (avgTestScore < 60) {
    recommendations.push("Increase test frequency and focus on answer writing practice.");
  }

  if (currentAffairsProgress < 30) {
    recommendations.push("Dedicate 1 hour daily to current affairs. It's crucial for both Prelims and Mains.");
  }

  if (essayProgress < 25) {
    recommendations.push("Start essay writing practice immediately. Write at least 2 essays per week.");
  }

  if (optionalProgress < 30) {
    recommendations.push("Focus on optional subject preparation. It's crucial for Mains scoring.");
  }

  if (psirProgress < 30) {
    recommendations.push("Increase PSIR optional subject study time. Balance theory with current events.");
  }

  return recommendations;
}

function generateReasoning(metrics: any, finalScore: number) {
  const { avgSubjectProgress, consistency, avgTestScore } = metrics;
  
  let reasoning = `Based on comprehensive analysis of your preparation data, `;
  
  if (finalScore >= 70) {
    reasoning += `you're on an excellent track with strong performance across multiple areas. `;
  } else if (finalScore >= 50) {
    reasoning += `you're making good progress but there's room for improvement in key areas. `;
  } else {
    reasoning += `your preparation needs significant enhancement to meet UPSC standards. `;
  }

  reasoning += `Your study consistency of ${consistency}% and average subject progress of ${Math.round(avgSubjectProgress)}% are key factors in this assessment.`;

  return reasoning;
}

function generateTrendData(goals: any[], tests: any[]) {
  const monthlyData: { [key: string]: any } = {};
  
  // Process goals data
  goals.forEach(goal => {
    const month = new Date(goal.date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, hours: 0, topics: 0, score: 0, testCount: 0 };
    }
    monthlyData[month].hours += parseFloat(goal.hours_studied);
    monthlyData[month].topics += parseInt(goal.topics_covered);
  });

  // Process test data
  tests.forEach(test => {
    const month = new Date(test.attempt_date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, hours: 0, topics: 0, score: 0, testCount: 0 };
    }
    monthlyData[month].score += (test.scored_marks / test.total_marks) * 100;
    monthlyData[month].testCount += 1;
  });

  // Calculate averages
  Object.keys(monthlyData).forEach(month => {
    if (monthlyData[month].testCount > 0) {
      monthlyData[month].score = Math.round(monthlyData[month].score / monthlyData[month].testCount);
    }
    monthlyData[month].hours = Math.round(monthlyData[month].hours);
  });

  return Object.values(monthlyData).slice(-6); // Last 6 months
}