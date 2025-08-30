import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Get user's progress data
    const [subjectProgress] = await connection.execute(
      'SELECT * FROM subject_progress WHERE user_id = 1'
    );
    
    const [testRecords] = await connection.execute(
      'SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC LIMIT 20'
    );
    
    const [dailyGoals] = await connection.execute(
      'SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC LIMIT 30'
    );
    
    await connection.end();
    
    // Calculate metrics
    const subjects = Array.isArray(subjectProgress) ? subjectProgress : [];
    const tests = Array.isArray(testRecords) ? testRecords : [];
    const goals = Array.isArray(dailyGoals) ? dailyGoals : [];
    
    // Calculate overall completion percentage
    const totalCompletion = subjects.reduce((sum: number, s: any) => {
      const lectureCompletion = (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100;
      const dppCompletion = (s.completed_dpps / Math.max(s.total_dpps, 1)) * 100;
      return sum + (lectureCompletion + dppCompletion) / 2;
    }, 0) / Math.max(subjects.length, 1);
    
    // Calculate test performance
    const avgTestScore = tests.reduce((sum: number, t: any) => {
      return sum + (t.scored_marks / Math.max(t.total_marks, 1)) * 100;
    }, 0) / Math.max(tests.length, 1);
    
    // Calculate study consistency
    const studyDays = goals.length;
    const totalHours = goals.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0);
    const avgDailyHours = totalHours / Math.max(studyDays, 1);
    
    // Calculate exam readiness (weighted average)
    const examReadiness = Math.round(
      (totalCompletion * 0.4) + 
      (avgTestScore * 0.3) + 
      (Math.min(avgDailyHours * 10, 100) * 0.3)
    );
    
    // Predict scores based on current performance (more realistic/tougher)
    const prelimsScore = Math.round(60 + (examReadiness - 50) * 0.6); // Tougher prelims scoring
    const mainsScore = Math.round(600 + (examReadiness - 50) * 3); // More conservative mains scoring
    
    // Estimate rank out of 1,000,000 (more realistic and tougher)
    const baseRank = 500000; // Starting point for average performance
    const rankReduction = (examReadiness - 50) * 8000; // More conservative scaling
    const overallRank = Math.max(1000, Math.min(1000000, Math.round(baseRank - rankReduction)));
    
    // Calculate days to exam
    const examDate = new Date('2026-05-24');
    const today = new Date();
    const timeToExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
    if (examReadiness >= 80 && studyDays >= 20) confidenceLevel = 'high';
    else if (examReadiness < 50 || studyDays < 10) confidenceLevel = 'low';
    
    // Generate recommendations
    const recommendations = [];
    if (totalCompletion < 60) {
      recommendations.push('Focus on completing more syllabus coverage');
    }
    if (avgTestScore < 70) {
      recommendations.push('Increase practice test frequency and analyze mistakes');
    }
    if (avgDailyHours < 6) {
      recommendations.push('Increase daily study hours to at least 6-8 hours');
    }
    if (studyDays < 20) {
      recommendations.push('Maintain consistent daily study routine');
    }
    
    // Generate risk factors
    const riskFactors = [];
    if (totalCompletion < 50) {
      riskFactors.push('Syllabus completion is behind schedule');
    }
    if (avgTestScore < 60) {
      riskFactors.push('Test performance needs significant improvement');
    }
    if (timeToExam < 100 && examReadiness < 70) {
      riskFactors.push('Limited time remaining for preparation');
    }
    
    const prediction = {
      examReadiness: Math.max(0, Math.min(100, examReadiness)),
      prelimsScore: Math.max(50, Math.min(200, prelimsScore)),
      mainsScore: Math.max(400, Math.min(1200, mainsScore)),
      overallRank,
      recommendations: recommendations.length > 0 ? recommendations : [
        'Continue your current study pattern',
        'Focus on revision and practice tests',
        'Maintain consistent study schedule'
      ],
      riskFactors: riskFactors.length > 0 ? riskFactors : [
        'No major risk factors identified'
      ],
      timeToExam,
      confidenceLevel
    };
    
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error('Prediction generation error:', error);
    
    // Fallback prediction
    return NextResponse.json({
      examReadiness: 72,
      prelimsScore: 118,
      mainsScore: 850,
      overallRank: 450,
      recommendations: [
        'Increase current affairs study time by 30 minutes daily',
        'Focus on answer writing practice for mains',
        'Solve more sectional tests for prelims'
      ],
      riskFactors: [
        'Current affairs coverage below optimal',
        'Mains answer writing needs improvement'
      ],
      timeToExam: 180,
      confidenceLevel: 'medium'
    });
  }
}