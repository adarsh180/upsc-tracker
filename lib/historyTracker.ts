// Comprehensive History Tracking - Never Forgets Your Efforts
import { getConnection, releaseConnection } from './db';

export class UPSCHistoryTracker {
  private static instance: UPSCHistoryTracker;

  static getInstance(): UPSCHistoryTracker {
    if (!UPSCHistoryTracker.instance) {
      UPSCHistoryTracker.instance = new UPSCHistoryTracker();
    }
    return UPSCHistoryTracker.instance;
  }

  // Store every single action - never lose any effort
  async recordActivity(userId: string, activity: any): Promise<void> {
    const connection = await getConnection();
    try {
      await connection.execute(`
        INSERT INTO user_activity_history 
        (user_id, activity_type, activity_data, timestamp, session_id) 
        VALUES (?, ?, ?, NOW(), ?)
      `, [userId, activity.type, JSON.stringify(activity.data), activity.sessionId || 'default']);
    } catch (error) {
      console.error('Error recording activity:', error);
    } finally {
      releaseConnection(connection);
    }
  }

  // Get complete preparation journey
  async getCompleteHistory(userId: string): Promise<any> {
    const connection = await getConnection();
    try {
      // Get all historical data
      const [activities] = await connection.execute(`
        SELECT * FROM user_activity_history 
        WHERE user_id = ? 
        ORDER BY timestamp DESC
      `, [userId]);

      const [progressSnapshots] = await connection.execute(`
        SELECT * FROM progress_snapshots 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [userId]);

      const [milestones] = await connection.execute(`
        SELECT * FROM user_milestones 
        WHERE user_id = ? 
        ORDER BY achieved_at DESC
      `, [userId]);

      return {
        totalActivities: (activities as any[]).length,
        activities: activities as any[],
        progressSnapshots: progressSnapshots as any[],
        milestones: milestones as any[],
        preparationDays: this.calculatePreparationDays(activities as any[]),
        effortMetrics: this.calculateEffortMetrics(activities as any[])
      };
    } finally {
      releaseConnection(connection);
    }
  }

  // Calculate total preparation effort
  private calculatePreparationDays(activities: any[]): number {
    if (activities.length === 0) return 0;
    const firstActivity = new Date(activities[activities.length - 1].timestamp);
    const lastActivity = new Date(activities[0].timestamp);
    return Math.ceil((lastActivity.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate comprehensive effort metrics
  private calculateEffortMetrics(activities: any[]): any {
    const studySessions = activities.filter(a => a.activity_type === 'study_session');
    const testAttempts = activities.filter(a => a.activity_type === 'test_attempt');
    const checkboxTicks = activities.filter(a => a.activity_type === 'checkbox_tick');
    const revisions = activities.filter(a => a.activity_type === 'revision');

    const totalStudyHours = studySessions.reduce((sum, s) => {
      const data = JSON.parse(s.activity_data);
      return sum + (data.duration_minutes / 60 || 0);
    }, 0);

    return {
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      totalTestAttempts: testAttempts.length,
      totalTopicsCompleted: checkboxTicks.length,
      totalRevisions: revisions.length,
      averageDailyHours: totalStudyHours / Math.max(1, this.calculatePreparationDays(activities)),
      consistencyScore: this.calculateHistoricalConsistency(studySessions)
    };
  }

  private calculateHistoricalConsistency(sessions: any[]): number {
    if (sessions.length < 7) return 0;
    
    const dailyHours = new Map<string, number>();
    sessions.forEach(s => {
      const date = new Date(s.timestamp).toDateString();
      const data = JSON.parse(s.activity_data);
      const hours = data.duration_minutes / 60 || 0;
      dailyHours.set(date, (dailyHours.get(date) || 0) + hours);
    });

    const studyDays = dailyHours.size;
    const totalDays = this.calculatePreparationDays(sessions);
    return Math.round((studyDays / totalDays) * 100);
  }
}

// Comprehensive Strength & Weakness Analyzer
export class StrengthWeaknessAnalyzer {
  static async analyzePerformance(userId: string): Promise<any> {
    const connection = await getConnection();
    try {
      // Get subject-wise performance
      const subjectAnalysis = await this.analyzeSubjectPerformance(connection, userId);
      const topicAnalysis = await this.analyzeTopicPerformance(connection, userId);
      const timeAnalysis = await this.analyzeTimePatterns(connection, userId);
      const testAnalysis = await this.analyzeTestPerformance(connection, userId);
      const revisionAnalysis = await this.analyzeRevisionPatterns(connection, userId);

      return {
        strengths: this.identifyStrengths(subjectAnalysis, topicAnalysis, testAnalysis),
        weaknesses: this.identifyWeaknesses(subjectAnalysis, topicAnalysis, testAnalysis),
        subjectWiseAnalysis: subjectAnalysis,
        topicWiseAnalysis: topicAnalysis,
        timePatterns: timeAnalysis,
        testPerformance: testAnalysis,
        revisionEffectiveness: revisionAnalysis,
        recommendations: this.generatePersonalizedRecommendations(subjectAnalysis, topicAnalysis, testAnalysis, revisionAnalysis)
      };
    } finally {
      releaseConnection(connection);
    }
  }

  private static async analyzeSubjectPerformance(connection: any, userId: string): Promise<any> {
    const [subjectProgress] = await connection.execute(`
      SELECT category, completed_lectures, total_lectures, completed_dpps, total_dpps, revisions
      FROM subject_progress WHERE user_id = ?
    `, [userId]);

    const [testRecords] = await connection.execute(`
      SELECT subject, AVG(scored_marks/total_marks*100) as avg_score, COUNT(*) as test_count
      FROM test_records WHERE user_id = ? GROUP BY subject
    `, [userId]);

    const subjects = (subjectProgress as any[]).map(s => {
      const lectureCompletion = s.total_lectures > 0 ? (s.completed_lectures / s.total_lectures) * 100 : 0;
      const dppCompletion = s.total_dpps > 0 ? (s.completed_dpps / s.total_dpps) * 100 : 0;
      const overallCompletion = (lectureCompletion + dppCompletion) / 2;
      
      const testData = (testRecords as any[]).find(t => t.subject?.toLowerCase().includes(s.category.toLowerCase()));
      const testScore = testData ? testData.avg_score : 0;
      const testCount = testData ? testData.test_count : 0;

      return {
        subject: s.category,
        completion: Math.round(overallCompletion),
        lectureCompletion: Math.round(lectureCompletion),
        dppCompletion: Math.round(dppCompletion),
        revisions: s.revisions,
        testScore: Math.round(testScore),
        testCount: testCount,
        overallScore: Math.round((overallCompletion * 0.4) + (testScore * 0.6))
      };
    });

    return subjects.sort((a, b) => b.overallScore - a.overallScore);
  }

  private static async analyzeTopicPerformance(connection: any, userId: string): Promise<any> {
    const [questionAttempts] = await connection.execute(`
      SELECT topic, AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as accuracy,
             AVG(time_taken) as avg_time, COUNT(*) as attempt_count
      FROM question_attempts WHERE user_id = ? AND topic IS NOT NULL
      GROUP BY topic HAVING attempt_count >= 5
      ORDER BY accuracy DESC
    `, [userId]);

    return (questionAttempts as any[]).map(q => ({
      topic: q.topic,
      accuracy: Math.round(q.accuracy),
      avgTime: Math.round(q.avg_time),
      attemptCount: q.attempt_count,
      efficiency: Math.round((q.accuracy / Math.max(q.avg_time, 60)) * 100) // Accuracy per minute
    }));
  }

  private static async analyzeTimePatterns(connection: any, userId: string): Promise<any> {
    const [studySessions] = await connection.execute(`
      SELECT HOUR(created_at) as hour, AVG(duration_minutes) as avg_duration,
             COUNT(*) as session_count
      FROM study_sessions WHERE user_id = ?
      GROUP BY HOUR(created_at)
      ORDER BY avg_duration DESC
    `, [userId]);

    const [dailyPatterns] = await connection.execute(`
      SELECT DAYOFWEEK(created_at) as day_of_week, 
             SUM(duration_minutes)/60 as total_hours,
             COUNT(*) as session_count
      FROM study_sessions WHERE user_id = ?
      GROUP BY DAYOFWEEK(created_at)
      ORDER BY total_hours DESC
    `, [userId]);

    return {
      peakHours: (studySessions as any[]).slice(0, 3).map(s => ({
        hour: s.hour,
        avgDuration: Math.round(s.avg_duration),
        sessionCount: s.session_count
      })),
      weeklyPattern: (dailyPatterns as any[]).map(d => ({
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.day_of_week - 1],
        totalHours: Math.round(d.total_hours * 10) / 10,
        sessionCount: d.session_count
      }))
    };
  }

  private static async analyzeTestPerformance(connection: any, userId: string): Promise<any> {
    const [testTrends] = await connection.execute(`
      SELECT DATE(attempt_date) as test_date, subject, scored_marks, total_marks,
             (scored_marks/total_marks*100) as percentage
      FROM test_records WHERE user_id = ?
      ORDER BY attempt_date DESC LIMIT 50
    `, [userId]);

    const tests = testTrends as any[];
    if (tests.length === 0) return { trend: 'insufficient_data', improvement: 0 };

    const recent = tests.slice(0, Math.ceil(tests.length / 2));
    const older = tests.slice(Math.ceil(tests.length / 2));

    const recentAvg = recent.reduce((sum, t) => sum + t.percentage, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, t) => sum + t.percentage, 0) / older.length : recentAvg;

    return {
      trend: recentAvg > olderAvg + 5 ? 'improving' : recentAvg < olderAvg - 5 ? 'declining' : 'stable',
      improvement: Math.round((recentAvg - olderAvg) * 10) / 10,
      recentAverage: Math.round(recentAvg),
      totalTests: tests.length,
      bestScore: Math.round(Math.max(...tests.map(t => t.percentage))),
      worstScore: Math.round(Math.min(...tests.map(t => t.percentage)))
    };
  }

  private static async analyzeRevisionPatterns(connection: any, userId: string): Promise<any> {
    const [revisionData] = await connection.execute(`
      SELECT category, revisions, completed_lectures, total_lectures
      FROM subject_progress WHERE user_id = ? AND revisions > 0
    `, [userId]);

    const subjects = revisionData as any[];
    if (subjects.length === 0) return { effectiveness: 0, recommendations: [] };

    const avgRevisions = subjects.reduce((sum, s) => sum + s.revisions, 0) / subjects.length;
    const completionRate = subjects.reduce((sum, s) => {
      return sum + (s.total_lectures > 0 ? (s.completed_lectures / s.total_lectures) : 0);
    }, 0) / subjects.length;

    return {
      averageRevisions: Math.round(avgRevisions * 10) / 10,
      completionRate: Math.round(completionRate * 100),
      effectiveness: Math.round((avgRevisions * completionRate) * 100),
      subjectWiseRevisions: subjects.map(s => ({
        subject: s.category,
        revisions: s.revisions,
        completion: Math.round((s.completed_lectures / s.total_lectures) * 100)
      })).sort((a, b) => b.revisions - a.revisions)
    };
  }

  private static identifyStrengths(subjectAnalysis: any[], topicAnalysis: any[], testAnalysis: any): string[] {
    const strengths = [];

    // Top performing subjects
    const topSubjects = subjectAnalysis.slice(0, 2);
    topSubjects.forEach(s => {
      if (s.overallScore > 70) {
        strengths.push(`${s.subject} - Strong performance (${s.overallScore}%)`);
      }
    });

    // High accuracy topics
    const accurateTopics = topicAnalysis.filter(t => t.accuracy > 80).slice(0, 3);
    accurateTopics.forEach(t => {
      strengths.push(`${t.topic} - High accuracy (${t.accuracy}%)`);
    });

    // Test performance
    if (testAnalysis.trend === 'improving') {
      strengths.push(`Test Performance - Consistent improvement (+${testAnalysis.improvement}%)`);
    }

    if (testAnalysis.bestScore > 85) {
      strengths.push(`Peak Performance - Achieved ${testAnalysis.bestScore}% in tests`);
    }

    return strengths.length > 0 ? strengths : ['Dedication to consistent preparation'];
  }

  private static identifyWeaknesses(subjectAnalysis: any[], topicAnalysis: any[], testAnalysis: any): string[] {
    const weaknesses = [];

    // Low performing subjects
    const weakSubjects = subjectAnalysis.filter(s => s.overallScore < 50);
    weakSubjects.forEach(s => {
      weaknesses.push(`${s.subject} - Needs attention (${s.overallScore}%)`);
    });

    // Low accuracy topics
    const weakTopics = topicAnalysis.filter(t => t.accuracy < 60).slice(0, 3);
    weakTopics.forEach(t => {
      weaknesses.push(`${t.topic} - Low accuracy (${t.accuracy}%)`);
    });

    // Test performance issues
    if (testAnalysis.trend === 'declining') {
      weaknesses.push(`Test Performance - Declining trend (${testAnalysis.improvement}%)`);
    }

    // Completion issues
    const incompleteSubjects = subjectAnalysis.filter(s => s.completion < 60);
    if (incompleteSubjects.length > 0) {
      weaknesses.push(`Syllabus Coverage - ${incompleteSubjects.length} subjects below 60% completion`);
    }

    return weaknesses.length > 0 ? weaknesses : ['Focus on increasing practice volume'];
  }

  private static generatePersonalizedRecommendations(subjectAnalysis: any[], topicAnalysis: any[], testAnalysis: any, revisionAnalysis: any): string[] {
    const recommendations = [];

    // Subject-specific recommendations
    const weakestSubject = subjectAnalysis[subjectAnalysis.length - 1];
    if (weakestSubject && weakestSubject.overallScore < 60) {
      recommendations.push(`PRIORITY: Focus 40% of daily study time on ${weakestSubject.subject}`);
      
      if (weakestSubject.lectureCompletion < 70) {
        recommendations.push(`Complete ${weakestSubject.subject} lectures first - currently at ${weakestSubject.lectureCompletion}%`);
      }
      
      if (weakestSubject.testCount < 5) {
        recommendations.push(`Take more ${weakestSubject.subject} tests - only ${weakestSubject.testCount} attempted so far`);
      }
    }

    // Revision recommendations
    if (revisionAnalysis.averageRevisions < 2) {
      recommendations.push(`Increase revision frequency - aim for 3+ revisions per subject`);
    }

    const lowRevisionSubjects = revisionAnalysis.subjectWiseRevisions?.filter((s: any) => s.revisions < 2);
    if (lowRevisionSubjects?.length > 0) {
      recommendations.push(`Urgent revision needed: ${lowRevisionSubjects.map((s: any) => s.subject).join(', ')}`);
    }

    // Test performance recommendations
    if (testAnalysis.trend === 'declining') {
      recommendations.push(`ALERT: Test scores declining - review study methods and take breaks`);
    }

    if (testAnalysis.totalTests < 20) {
      recommendations.push(`Increase test frequency - aim for daily practice tests`);
    }

    // Topic-specific recommendations
    const weakTopics = topicAnalysis.filter(t => t.accuracy < 60);
    if (weakTopics.length > 0) {
      recommendations.push(`Focus on weak topics: ${weakTopics.slice(0, 3).map(t => t.topic).join(', ')}`);
    }

    // Time management
    const inefficientTopics = topicAnalysis.filter(t => t.efficiency < 50);
    if (inefficientTopics.length > 0) {
      recommendations.push(`Improve speed in: ${inefficientTopics.slice(0, 2).map(t => t.topic).join(', ')}`);
    }

    // General recommendations
    const avgCompletion = subjectAnalysis.reduce((sum, s) => sum + s.completion, 0) / subjectAnalysis.length;
    if (avgCompletion < 70) {
      recommendations.push(`Accelerate syllabus completion - currently at ${Math.round(avgCompletion)}% overall`);
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }
}