// Complete History & Analysis API - Never forgets your efforts
import { NextResponse } from 'next/server';
import { getConnection, releaseConnection } from '@/lib/db';
import { UPSCHistoryTracker, StrengthWeaknessAnalyzer } from '@/lib/historyTracker';
import { PersonalizedSuggestionsEngine } from '@/lib/personalizedSuggestions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1';
    const type = searchParams.get('type') || 'complete';

    const historyTracker = UPSCHistoryTracker.getInstance();

    if (type === 'complete') {
      // Get complete preparation journey
      const completeHistory = await historyTracker.getCompleteHistory(userId);
      const performanceAnalysis = await StrengthWeaknessAnalyzer.analyzePerformance(userId);
      
      // Calculate time to exam
      const examDate = new Date('2026-05-24');
      const timeToExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Generate personalized suggestions
      const suggestions = PersonalizedSuggestionsEngine.generateDailySuggestions(
        performanceAnalysis, 
        completeHistory, 
        timeToExam
      );

      return NextResponse.json({
        success: true,
        data: {
          preparationJourney: {
            totalDays: completeHistory.preparationDays,
            totalActivities: completeHistory.totalActivities,
            effortMetrics: completeHistory.effortMetrics,
            milestones: completeHistory.milestones
          },
          performanceAnalysis: {
            strengths: performanceAnalysis.strengths,
            weaknesses: performanceAnalysis.weaknesses,
            subjectAnalysis: performanceAnalysis.subjectWiseAnalysis,
            topicAnalysis: performanceAnalysis.topicWiseAnalysis,
            timePatterns: performanceAnalysis.timePatterns,
            testPerformance: performanceAnalysis.testPerformance,
            revisionEffectiveness: performanceAnalysis.revisionEffectiveness
          },
          personalizedSuggestions: suggestions,
          examCountdown: {
            daysRemaining: timeToExam,
            phase: timeToExam < 90 ? 'Final Phase' : timeToExam < 180 ? 'Intensive Phase' : 'Preparation Phase'
          },
          lastUpdated: new Date().toISOString()
        }
      });

    } else if (type === 'activity') {
      // Get recent activity history
      const recentHistory = await getRecentActivity(userId);
      return NextResponse.json({
        success: true,
        data: recentHistory
      });

    } else if (type === 'analysis') {
      // Get only performance analysis
      const analysis = await StrengthWeaknessAnalyzer.analyzePerformance(userId);
      return NextResponse.json({
        success: true,
        data: analysis
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type parameter'
    });

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch history data',
      fallback: generateFallbackHistory()
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, activity } = body;

    if (!userId || !activity) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const historyTracker = UPSCHistoryTracker.getInstance();
    await historyTracker.recordActivity(userId, activity);

    return NextResponse.json({
      success: true,
      message: 'Activity recorded successfully'
    });

  } catch (error) {
    console.error('Error recording activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record activity'
    });
  }
}

async function getRecentActivity(userId: string): Promise<any> {
  const connection = await getConnection();
  try {
    const [activities] = await connection.execute(`
      SELECT activity_type, activity_data, timestamp
      FROM user_activity_history 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `, [userId]);

    return {
      recentActivities: (activities as any[]).map(a => ({
        type: a.activity_type,
        data: JSON.parse(a.activity_data),
        timestamp: a.timestamp,
        timeAgo: getTimeAgo(new Date(a.timestamp))
      })),
      summary: generateActivitySummary(activities as any[])
    };
  } finally {
    releaseConnection(connection);
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

function generateActivitySummary(activities: any[]): any {
  const today = new Date().toDateString();
  const todayActivities = activities.filter(a => new Date(a.timestamp).toDateString() === today);
  
  const activityCounts = activities.reduce((counts, a) => {
    counts[a.activity_type] = (counts[a.activity_type] || 0) + 1;
    return counts;
  }, {});

  return {
    todayCount: todayActivities.length,
    totalCount: activities.length,
    mostFrequentActivity: Object.entries(activityCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none',
    activityBreakdown: activityCounts
  };
}

function generateFallbackHistory(): any {
  return {
    preparationJourney: {
      totalDays: 45,
      totalActivities: 234,
      effortMetrics: {
        totalStudyHours: 180,
        totalTestAttempts: 25,
        totalTopicsCompleted: 156,
        totalRevisions: 89,
        averageDailyHours: 4.2,
        consistencyScore: 72
      }
    },
    performanceAnalysis: {
      strengths: [
        "General Studies 3 - Strong performance (78%)",
        "Economy topics - High accuracy (85%)",
        "Test Performance - Consistent improvement (+12%)"
      ],
      weaknesses: [
        "General Studies 4 - Needs attention (45%)",
        "Ethics topics - Low accuracy (52%)",
        "Syllabus Coverage - 3 subjects below 60% completion"
      ],
      subjectAnalysis: [
        { subject: "GS3", completion: 82, overallScore: 78 },
        { subject: "GS1", completion: 75, overallScore: 71 },
        { subject: "GS2", completion: 68, overallScore: 65 },
        { subject: "PSIR", completion: 58, overallScore: 62 },
        { subject: "GS4", completion: 45, overallScore: 45 }
      ]
    },
    personalizedSuggestions: {
      priority: [
        "🎯 HIGH PRIORITY: GS4 needs immediate attention (45%)",
        "🔁 REVISION NEEDED: PSIR, GS2",
        "📝 Daily full-length test practice"
      ],
      studyPlan: {
        morningSession: {
          time: "9:00 - 12:00",
          focus: "GS4 Ethics",
          activities: ["Case studies", "Concept clarity", "Note making"]
        }
      }
    },
    examCountdown: {
      daysRemaining: 180,
      phase: "Preparation Phase"
    }
  };
}