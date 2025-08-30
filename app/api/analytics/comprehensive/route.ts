import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    try {
        const connection = await getConnection();

        // Get all user data
        const [subjects] = await connection.execute(
            'SELECT * FROM subject_progress WHERE user_id = 1'
        );

        const [goals] = await connection.execute(
            'SELECT * FROM daily_goals WHERE user_id = 1 ORDER BY date DESC LIMIT 90'
        );

        const [tests] = await connection.execute(
            'SELECT * FROM test_records WHERE user_id = 1 ORDER BY attempt_date DESC LIMIT 50'
        );

        const [mood] = await connection.execute(
            'SELECT * FROM mood_entries WHERE user_id = 1 ORDER BY date DESC LIMIT 30'
        );

        await connection.end();

        const subjectsArray = Array.isArray(subjects) ? subjects : [];
        const goalsArray = Array.isArray(goals) ? goals : [];
        const testsArray = Array.isArray(tests) ? tests : [];
        const moodArray = Array.isArray(mood) ? mood : [];

        // Calculate comprehensive analytics
        const analytics = {
            // Overall Progress
            overallProgress: {
                totalSubjects: subjectsArray.length,
                avgCompletion: subjectsArray.reduce((sum: number, s: any) => {
                    const completion = (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100;
                    return sum + completion;
                }, 0) / Math.max(subjectsArray.length, 1),
                totalLectures: subjectsArray.reduce((sum: number, s: any) => sum + s.total_lectures, 0),
                completedLectures: subjectsArray.reduce((sum: number, s: any) => sum + s.completed_lectures, 0),
                totalDPPs: subjectsArray.reduce((sum: number, s: any) => sum + s.total_dpps, 0),
                completedDPPs: subjectsArray.reduce((sum: number, s: any) => sum + s.completed_dpps, 0)
            },

            // Study Patterns
            studyPatterns: {
                totalHours: goalsArray.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0),
                totalSessions: goalsArray.length,
                avgHoursPerDay: goalsArray.reduce((sum: number, g: any) => sum + parseFloat(g.hours_studied || 0), 0) / Math.max(goalsArray.length, 1),
                totalTopics: goalsArray.reduce((sum: number, g: any) => sum + (g.topics_covered || 0), 0),
                totalQuestions: goalsArray.reduce((sum: number, g: any) => sum + (g.questions_solved || 0), 0),
                studyDays: goalsArray.length,
                consistency: calculateConsistency(goalsArray)
            },

            // Test Performance
            testPerformance: {
                totalTests: testsArray.length,
                avgScore: testsArray.reduce((sum: number, t: any) => {
                    return sum + (t.scored_marks / Math.max(t.total_marks, 1)) * 100;
                }, 0) / Math.max(testsArray.length, 1),
                prelimsTests: testsArray.filter((t: any) => t.test_type === 'prelims').length,
                mainsTests: testsArray.filter((t: any) => t.test_type === 'mains').length,
                recentTrend: calculateTestTrend(testsArray)
            },

            // Subject-wise Analysis
            subjectAnalysis: subjectsArray.map((s: any) => ({
                subject: s.subject,
                category: s.category,
                completion: Math.round((s.completed_lectures / Math.max(s.total_lectures, 1)) * 100),
                dppCompletion: Math.round((s.completed_dpps / Math.max(s.total_dpps, 1)) * 100),
                status: getSubjectStatus(s),
                priority: getSubjectPriority(s)
            })),

            // Weak Areas
            weakAreas: subjectsArray
                .filter((s: any) => (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100 < 50)
                .map((s: any) => s.subject)
                .slice(0, 5),

            // Strengths
            strengths: subjectsArray
                .filter((s: any) => (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100 > 75)
                .map((s: any) => s.subject)
                .slice(0, 5),

            // Mood Analysis
            moodAnalysis: {
                entries: moodArray.length,
                avgMood: calculateAvgMood(moodArray),
                moodTrend: calculateMoodTrend(moodArray),
                recentMood: moodArray.length > 0 ? (moodArray[0] as any)?.mood || 'No data' : 'No data'
            },

            // Time Analysis
            timeAnalysis: {
                peakStudyHours: calculatePeakHours(goalsArray),
                weeklyPattern: calculateWeeklyPattern(goalsArray),
                monthlyTrend: calculateMonthlyTrend(goalsArray)
            },

            // Predictions
            predictions: {
                examReadiness: calculateExamReadiness(subjectsArray, goalsArray, testsArray),
                estimatedRank: estimateRank(subjectsArray, goalsArray, testsArray),
                timeToComplete: estimateTimeToComplete(subjectsArray, goalsArray)
            }
        };

        return NextResponse.json(analytics);

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
    }
}

// Helper functions
function calculateConsistency(goals: any[]): number {
    if (goals.length < 7) return 0;

    const last7Days = goals.slice(0, 7);
    const studyDays = last7Days.filter(g => parseFloat(g.hours_studied || 0) > 0).length;
    return Math.round((studyDays / 7) * 100);
}

function calculateTestTrend(tests: any[]): string {
    if (tests.length < 2) return 'insufficient_data';

    const recent = tests.slice(0, 5);
    const older = tests.slice(5, 10);

    const recentAvg = recent.reduce((sum, t) => sum + (t.scored_marks / t.total_marks) * 100, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, t) => sum + (t.scored_marks / t.total_marks) * 100, 0) / older.length : recentAvg;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
}

function getSubjectStatus(subject: any): string {
    const completion = (subject.completed_lectures / Math.max(subject.total_lectures, 1)) * 100;
    if (completion >= 90) return 'excellent';
    if (completion >= 70) return 'good';
    if (completion >= 50) return 'average';
    if (completion >= 25) return 'needs_attention';
    return 'critical';
}

function getSubjectPriority(subject: any): 'high' | 'medium' | 'low' {
    const completion = (subject.completed_lectures / Math.max(subject.total_lectures, 1)) * 100;
    if (completion < 30) return 'high';
    if (completion < 70) return 'medium';
    return 'low';
}

function calculateAvgMood(moods: any[]): number {
    if (moods.length === 0) return 0;

    const moodValues: { [key: string]: number } = {
        'excellent': 5,
        'good': 4,
        'neutral': 3,
        'stressed': 2,
        'overwhelmed': 1
    };

    const total = moods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0);
    return Math.round((total / moods.length) * 20); // Convert to percentage
}

function calculateMoodTrend(moods: any[]): string {
    if (moods.length < 3) return 'insufficient_data';

    const recent = moods.slice(0, 3);
    const older = moods.slice(3, 6);

    const moodValues: { [key: string]: number } = {
        'excellent': 5,
        'good': 4,
        'neutral': 3,
        'stressed': 2,
        'overwhelmed': 1
    };

    const recentAvg = recent.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / older.length : recentAvg;

    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
}

function calculatePeakHours(goals: any[]): string {
    // Simplified - would need actual time data
    return '6-8 AM';
}

function calculateWeeklyPattern(goals: any[]): any {
    // Simplified weekly pattern analysis
    return {
        mostProductiveDay: 'Monday',
        leastProductiveDay: 'Sunday',
        avgHoursPerWeek: goals.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0) / Math.max(Math.ceil(goals.length / 7), 1)
    };
}

function calculateMonthlyTrend(goals: any[]): string {
    if (goals.length < 30) return 'insufficient_data';

    const thisMonth = goals.slice(0, 30);
    const lastMonth = goals.slice(30, 60);

    const thisMonthHours = thisMonth.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0);
    const lastMonthHours = lastMonth.length > 0 ? lastMonth.reduce((sum, g) => sum + parseFloat(g.hours_studied || 0), 0) : thisMonthHours;

    if (thisMonthHours > lastMonthHours * 1.1) return 'increasing';
    if (thisMonthHours < lastMonthHours * 0.9) return 'decreasing';
    return 'stable';
}

function calculateExamReadiness(subjects: any[], goals: any[], tests: any[]): number {
    const subjectCompletion = subjects.reduce((sum, s) => {
        return sum + (s.completed_lectures / Math.max(s.total_lectures, 1)) * 100;
    }, 0) / Math.max(subjects.length, 1);

    // More stringent consistency calculation
    const studyConsistency = goals.length > 0 ? Math.min(goals.length * 1.5, 80) : 0;
    
    // Tougher test performance evaluation
    const testPerformance = tests.length > 0 ? 
        tests.reduce((sum, t) => sum + (t.scored_marks / t.total_marks) * 100, 0) / tests.length : 40;

    // More conservative weighting - harder to achieve high readiness
    const rawScore = (subjectCompletion * 0.35) + (studyConsistency * 0.25) + (testPerformance * 0.4);
    
    // Apply difficulty multiplier to make it tougher
    return Math.round(rawScore * 0.85); // 15% reduction to make it more realistic
}

function estimateRank(subjects: any[], goals: any[], tests: any[]): number {
    const readiness = calculateExamReadiness(subjects, goals, tests);
    // More realistic ranking out of 1,000,000 candidates
    const baseRank = 500000; // Starting point for average performance
    const rankReduction = (readiness - 50) * 8000; // Conservative scaling
    return Math.max(1000, Math.min(1000000, Math.round(baseRank - rankReduction)));
}

function estimateTimeToComplete(subjects: any[], goals: any[]): number {
    const totalRemaining = subjects.reduce((sum, s) => {
        return sum + Math.max(0, s.total_lectures - s.completed_lectures);
    }, 0);

    const avgLecturesPerDay = goals.length > 0 ?
        goals.reduce((sum, g) => sum + (g.topics_covered || 0), 0) / goals.length : 1;

    return Math.ceil(totalRemaining / Math.max(avgLecturesPerDay, 1));
}