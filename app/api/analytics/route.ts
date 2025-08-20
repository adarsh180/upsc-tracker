import { NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Ensure tables exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        date DATE,
        subject VARCHAR(100),
        hours_studied DECIMAL(3,1) DEFAULT 0,
        topics_covered INT DEFAULT 0,
        questions_solved INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subject_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        category VARCHAR(50),
        total_lectures INT DEFAULT 0,
        completed_lectures INT DEFAULT 0,
        total_dpps INT DEFAULT 0,
        completed_dpps INT DEFAULT 0,
        questions_count INT DEFAULT 0,
        revisions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add questions_count column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE subject_progress ADD COLUMN questions_count INT DEFAULT 0
      `);
    } catch (e) {
      // Column already exists
    }
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        test_type ENUM('prelims', 'mains') DEFAULT 'prelims',
        test_category ENUM('sectional', 'full-length', 'mock', 'subjective', 'topic-wise') DEFAULT 'mock',
        subject VARCHAR(100),
        total_marks INT DEFAULT 0,
        scored_marks DECIMAL(5,2) DEFAULT 0,
        attempt_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get data with safe fallbacks
    const [subjects] = await connection.execute(
      'SELECT * FROM subject_progress WHERE user_id = 1'
    );
    
    // Get current affairs progress
    const [currentAffairs] = await connection.execute(
      'SELECT * FROM current_affairs WHERE user_id = 1 LIMIT 1'
    );
    
    // Get essay progress
    const [essayProgress] = await connection.execute(
      'SELECT * FROM essay_progress WHERE user_id = 1 LIMIT 1'
    );
    
    // Get optional progress
    const [optionalProgress] = await connection.execute(
      'SELECT * FROM optional_progress WHERE user_id = 1'
    );
    
    const [tests] = await connection.execute(
      'SELECT *, CASE WHEN test_type = "prelims" THEN 100 WHEN test_type = "mains" THEN 20 ELSE 20 END as questions_count FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC'
    );
    
    const [goals] = await connection.execute(
      'SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC'
    );
    
    // Safe array handling with proper typing
    const subjectsArray = Array.isArray(subjects) ? subjects as any[] : [];
    const testsArray = Array.isArray(tests) ? tests as any[] : [];
    const goalsArray = Array.isArray(goals) ? goals as any[] : [];
    const currentAffairsArray = Array.isArray(currentAffairs) ? currentAffairs as any[] : [];
    const essayProgressArray = Array.isArray(essayProgress) ? essayProgress as any[] : [];
    const optionalProgressArray = Array.isArray(optionalProgress) ? optionalProgress as any[] : [];
    
    // Process all subjects data
    const allSubjectsData = [...subjectsArray];
    
    // Add current affairs data
    if (currentAffairsArray.length > 0) {
      const ca = currentAffairsArray[0];
      allSubjectsData.push({
        subject: 'Current Affairs',
        category: 'CURRENT AFFAIRS',
        completed_lectures: ca.completed_topics || 0,
        total_lectures: ca.total_topics || 300,
        completed_dpps: 0,
        total_dpps: 0
      });
    } else {
      allSubjectsData.push({
        subject: 'Current Affairs',
        category: 'CURRENT AFFAIRS',
        completed_lectures: 0,
        total_lectures: 300,
        completed_dpps: 0,
        total_dpps: 0
      });
    }
    
    // Add essay data
    if (essayProgressArray.length > 0) {
      const essay = essayProgressArray[0];
      allSubjectsData.push({
        subject: 'Essay Writing',
        category: 'ESSAY',
        completed_lectures: essay.lectures_completed || 0,
        total_lectures: essay.total_lectures || 10,
        completed_dpps: essay.essays_written || 0,
        total_dpps: essay.total_essays || 100
      });
    } else {
      allSubjectsData.push({
        subject: 'Essay Writing',
        category: 'ESSAY',
        completed_lectures: 0,
        total_lectures: 10,
        completed_dpps: 0,
        total_dpps: 100
      });
    }
    
    // Add optional subjects with Paper 2 logic
    const optionalSections = ['Lectures', 'Answer Writing', 'PYQ', 'Tests'];
    optionalSections.forEach(section => {
      const optionalData = optionalProgressArray.find(op => op.section_name === section);
      if (optionalData) {
        allSubjectsData.push({
          subject: `Optional ${section}`,
          category: 'OPTIONAL',
          completed_lectures: optionalData.completed_items || 0,
          total_lectures: optionalData.total_items || 140,
          completed_dpps: 0,
          total_dpps: 0
        });
      } else {
        allSubjectsData.push({
          subject: `Optional ${section}`,
          category: 'OPTIONAL',
          completed_lectures: 0,
          total_lectures: 140,
          completed_dpps: 0,
          total_dpps: 0
        });
      }
    });
    
    // Add Optional Paper 2 (unlocks after 90 lectures completed)
    const lecturesCompleted = optionalProgressArray.find(op => op.section_name === 'Lectures')?.completed_items || 0;
    if (lecturesCompleted >= 90) {
      allSubjectsData.push({
        subject: 'Optional Paper 2',
        category: 'OPTIONAL',
        completed_lectures: Math.max(0, lecturesCompleted - 90),
        total_lectures: 50,
        completed_dpps: 0,
        total_dpps: 0
      });
    }
    
    // Ethics is already included in subjectsArray from GS4 category, no need to add separately
    
    // Safe calculations
    const totalDppQuestions = subjectsArray.reduce((sum, s) => sum + (s?.questions_count || 0), 0);
    const prelimsTestQuestions = testsArray.filter((t: any) => t?.test_type === 'prelims').reduce((sum, t: any) => sum + (t?.questions_count || 0), 0);
    const mainsTestQuestions = testsArray.filter((t: any) => t?.test_type === 'mains').reduce((sum, t: any) => sum + (t?.questions_count || 0), 0);
    const totalGoalQuestions = goalsArray.reduce((sum, g) => sum + (g?.questions_solved || 0), 0);
    
    const prelimsQuestions = totalDppQuestions + prelimsTestQuestions + totalGoalQuestions;
    const mainsQuestions = mainsTestQuestions;
    
    // Weekly trend
    const [weeklyData] = await connection.execute(`
      SELECT 
        DATE(date) as day,
        COALESCE(SUM(hours_studied), 0) as hours,
        COALESCE(SUM(questions_solved), 0) as questions,
        COUNT(*) as sessions
      FROM daily_goals 
      WHERE user_id = 1 AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY DATE(date) ASC
    `);
    
    // Monthly trend
    const [monthlyData] = await connection.execute(`
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month_num,
        MONTHNAME(date) as month,
        COALESCE(SUM(hours_studied), 0) as hours,
        COALESCE(SUM(topics_covered), 0) as topics,
        COALESCE(SUM(questions_solved), 0) as questions
      FROM daily_goals 
      WHERE user_id = 1 AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(date), MONTH(date), MONTHNAME(date)
      ORDER BY YEAR(date), MONTH(date) ASC
    `);
    
    releaseConnection(connection);
    
    return NextResponse.json({
      subjects: allSubjectsData,
      tests: testsArray,
      goals: goalsArray,
      analytics: {
        totalStudyHours: goalsArray.reduce((sum, g) => sum + parseFloat(g?.hours_studied || 0), 0),
        completedTopics: subjectsArray.reduce((sum, s) => sum + (s?.completed_lectures || 0) + (s?.completed_dpps || 0), 0),
        testsTaken: testsArray.length,
        totalQuestions: prelimsQuestions + mainsQuestions,
        prelimsQuestions,
        mainsQuestions,
        currentStreak: 0
      },
      trends: {
        weekly: Array.isArray(weeklyData) ? weeklyData : [],
        monthly: Array.isArray(monthlyData) ? monthlyData : []
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({
      subjects: [],
      tests: [],
      goals: [],
      analytics: {
        totalStudyHours: 0,
        completedTopics: 0,
        testsTaken: 0,
        totalQuestions: 0,
        prelimsQuestions: 0,
        mainsQuestions: 0,
        currentStreak: 0
      },
      trends: {
        weekly: [],
        monthly: []
      }
    }, { status: 200 });
  }
}