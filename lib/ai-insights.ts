import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface StudyPattern {
  bestStudyDays: string[];
  peakHours: number[];
  subjectPreferences: { subject: string; efficiency: number }[];
  consistencyScore: number;
  improvementAreas: string[];
}

export interface PredictiveInsights {
  nextWeekPrediction: {
    expectedHours: number;
    expectedTopics: number;
    confidence: number;
  };
  riskFactors: string[];
  opportunities: string[];
  recommendations: string[];
}

export class AIInsightsEngine {
  // Analyze study patterns using advanced algorithms
  static analyzeStudyPatterns(data: any[]): StudyPattern {
    // Day-of-week analysis
    const dayPerformance = new Map<string, { hours: number; topics: number; count: number }>();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    data.forEach(entry => {
      if (entry.study_date) {
        const dayOfWeek = new Date(entry.study_date).getDay();
        const dayName = days[dayOfWeek];
        
        if (!dayPerformance.has(dayName)) {
          dayPerformance.set(dayName, { hours: 0, topics: 0, count: 0 });
        }
        
        const dayData = dayPerformance.get(dayName)!;
        dayData.hours += entry.total_hours || 0;
        dayData.topics += entry.total_topics || 0;
        dayData.count += 1;
      }
    });

    // Find best performing days
    const bestStudyDays = Array.from(dayPerformance.entries())
      .map(([day, data]) => ({
        day,
        avgEfficiency: data.count > 0 ? (data.topics / data.hours) || 0 : 0,
        avgHours: data.count > 0 ? data.hours / data.count : 0
      }))
      .filter(d => d.avgHours > 0)
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency)
      .slice(0, 3)
      .map(d => d.day);

    // Calculate consistency score
    const studyDays = data.filter(d => (d.total_hours || 0) > 0).length;
    const totalDays = data.length;
    const consistencyScore = totalDays > 0 ? (studyDays / totalDays) * 100 : 0;

    // Identify improvement areas
    const improvementAreas = [];
    if (consistencyScore < 70) improvementAreas.push('Study consistency');
    
    const avgEfficiency = data.reduce((sum, d) => sum + (d.avg_efficiency || 0), 0) / data.length;
    if (avgEfficiency < 2) improvementAreas.push('Learning efficiency');
    
    const weekendStudy = (dayPerformance.get('Saturday')?.count || 0) + (dayPerformance.get('Sunday')?.count || 0);
    if (weekendStudy < studyDays * 0.2) improvementAreas.push('Weekend utilization');

    return {
      bestStudyDays,
      peakHours: [9, 10, 11, 14, 15, 16], // Default peak hours, could be enhanced with hourly data
      subjectPreferences: [], // Would need subject-wise data
      consistencyScore,
      improvementAreas
    };
  }

  // Generate predictive insights using machine learning algorithms
  static generatePredictiveInsights(historicalData: any[], patterns: StudyPattern): PredictiveInsights {
    // Simple linear regression for prediction
    const recentData = historicalData.slice(-14); // Last 2 weeks
    const avgHours = recentData.reduce((sum, d) => sum + (d.total_hours || 0), 0) / recentData.length;
    const avgTopics = recentData.reduce((sum, d) => sum + (d.total_topics || 0), 0) / recentData.length;
    
    // Calculate trend
    const firstWeek = recentData.slice(0, 7);
    const secondWeek = recentData.slice(7, 14);
    
    const firstWeekAvg = firstWeek.reduce((sum, d) => sum + (d.total_hours || 0), 0) / firstWeek.length;
    const secondWeekAvg = secondWeek.reduce((sum, d) => sum + (d.total_hours || 0), 0) / secondWeek.length;
    
    const trend = secondWeekAvg > firstWeekAvg ? 1.1 : secondWeekAvg < firstWeekAvg ? 0.9 : 1.0;
    
    // Risk factor analysis
    const riskFactors = [];
    if (patterns.consistencyScore < 60) riskFactors.push('Low study consistency may impact exam preparation');
    if (avgHours < 4) riskFactors.push('Below recommended daily study hours for UPSC preparation');
    if (trend < 1) riskFactors.push('Declining study trend detected');

    // Opportunity identification
    const opportunities = [];
    if (patterns.bestStudyDays.length > 0) {
      opportunities.push(`Optimize ${patterns.bestStudyDays.join(', ')} for maximum productivity`);
    }
    if (patterns.consistencyScore > 80) {
      opportunities.push('Strong consistency - consider increasing study intensity');
    }

    // Generate recommendations
    const recommendations = [];
    if (patterns.improvementAreas.includes('Study consistency')) {
      recommendations.push('Set daily study reminders and create a fixed study schedule');
    }
    if (patterns.improvementAreas.includes('Learning efficiency')) {
      recommendations.push('Focus on active learning techniques and regular revision');
    }
    if (avgHours < 6) {
      recommendations.push('Gradually increase daily study hours to meet UPSC requirements');
    }

    return {
      nextWeekPrediction: {
        expectedHours: avgHours * 7 * trend,
        expectedTopics: avgTopics * 7 * trend,
        confidence: Math.min(patterns.consistencyScore / 100, 0.9)
      },
      riskFactors,
      opportunities,
      recommendations
    };
  }

  // Generate comprehensive AI insights using Groq
  static async generateComprehensiveInsights(
    data: any[],
    patterns: StudyPattern,
    predictions: PredictiveInsights
  ): Promise<string> {
    const totalHours = data.reduce((sum, d) => sum + (d.total_hours || 0), 0);
    const totalTopics = data.reduce((sum, d) => sum + (d.total_topics || 0), 0);
    const totalQuestions = data.reduce((sum, d) => sum + (d.total_questions || 0), 0);
    const studyDays = data.filter(d => (d.total_hours || 0) > 0).length;

    const prompt = `
As an expert UPSC mentor and data scientist, analyze this comprehensive study data and provide advanced insights:

PERFORMANCE METRICS:
- Total Study Days: ${studyDays}/${data.length}
- Total Hours: ${totalHours.toFixed(1)}
- Total Topics: ${totalTopics}
- Total Questions: ${totalQuestions}
- Consistency Score: ${patterns.consistencyScore.toFixed(1)}%
- Best Study Days: ${patterns.bestStudyDays.join(', ')}

PREDICTIVE ANALYSIS:
- Next Week Expected Hours: ${predictions.nextWeekPrediction.expectedHours.toFixed(1)}
- Next Week Expected Topics: ${predictions.nextWeekPrediction.expectedTopics.toFixed(0)}
- Prediction Confidence: ${(predictions.nextWeekPrediction.confidence * 100).toFixed(0)}%

IDENTIFIED PATTERNS:
- Improvement Areas: ${patterns.improvementAreas.join(', ')}
- Risk Factors: ${predictions.riskFactors.join('; ')}
- Opportunities: ${predictions.opportunities.join('; ')}

ADVANCED ANALYSIS REQUIRED:
1. Learning Velocity Assessment: Analyze if current pace aligns with UPSC timeline
2. Subject Balance Evaluation: Recommend optimal time allocation across GS papers
3. Retention Optimization: Suggest revision cycles based on forgetting curve
4. Stress Management: Identify potential burnout indicators and prevention
5. Strategic Planning: Provide month-wise preparation roadmap
6. Performance Benchmarking: Compare against successful UPSC candidates' patterns

Provide specific, actionable insights in a structured format. Focus on:
- Immediate action items (next 7 days)
- Medium-term strategies (next 30 days)
- Long-term preparation adjustments
- Psychological and motivational aspects
- Data-driven recommendations for improvement

Keep response comprehensive but under 400 words.
    `;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert UPSC mentor with advanced data analytics expertise. Provide comprehensive, actionable insights based on study pattern analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || 'Unable to generate comprehensive insights at this time.';
    } catch (error) {
      console.error('AI insights generation failed:', error);
      
      // Fallback to rule-based insights
      return this.generateFallbackInsights(data, patterns, predictions);
    }
  }

  // Fallback insights when AI is unavailable
  private static generateFallbackInsights(
    data: any[],
    patterns: StudyPattern,
    predictions: PredictiveInsights
  ): string {
    const insights = [];
    
    insights.push("📊 PERFORMANCE ANALYSIS:");
    insights.push(`Your consistency score of ${patterns.consistencyScore.toFixed(1)}% ${patterns.consistencyScore > 75 ? 'shows excellent discipline' : 'needs improvement for UPSC success'}.`);
    
    if (patterns.bestStudyDays.length > 0) {
      insights.push(`Peak performance on ${patterns.bestStudyDays.join(', ')} - leverage these days for challenging topics.`);
    }

    insights.push("\n🎯 IMMEDIATE ACTIONS (Next 7 Days):");
    predictions.recommendations.slice(0, 2).forEach(rec => insights.push(`• ${rec}`));

    insights.push("\n📈 STRATEGIC RECOMMENDATIONS:");
    if (predictions.nextWeekPrediction.confidence > 0.7) {
      insights.push(`• High prediction confidence suggests stable study pattern - maintain momentum`);
    } else {
      insights.push(`• Inconsistent patterns detected - focus on building routine`);
    }

    if (predictions.riskFactors.length > 0) {
      insights.push(`• Address key risks: ${predictions.riskFactors[0]}`);
    }

    insights.push("\n🚀 OPTIMIZATION OPPORTUNITIES:");
    predictions.opportunities.forEach(opp => insights.push(`• ${opp}`));

    return insights.join('\n');
  }

  // Real-time performance scoring
  static calculatePerformanceScore(data: any[]): {
    overall: number;
    consistency: number;
    efficiency: number;
    volume: number;
    trend: number;
  } {
    const studyDays = data.filter(d => (d.total_hours || 0) > 0).length;
    const consistency = (studyDays / data.length) * 100;
    
    const avgEfficiency = data.reduce((sum, d) => sum + (d.avg_efficiency || 0), 0) / data.length;
    const efficiency = Math.min((avgEfficiency / 3) * 100, 100); // Normalize to 100
    
    const avgHours = data.reduce((sum, d) => sum + (d.total_hours || 0), 0) / data.length;
    const volume = Math.min((avgHours / 8) * 100, 100); // Normalize to 8 hours max
    
    // Calculate trend (last week vs previous week)
    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);
    const recentAvg = recent.reduce((sum, d) => sum + (d.total_hours || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + (d.total_hours || 0), 0) / previous.length;
    const trendRatio = previousAvg > 0 ? recentAvg / previousAvg : 1;
    const trend = Math.min(trendRatio * 50 + 50, 100); // Normalize around 50
    
    const overall = (consistency * 0.3 + efficiency * 0.3 + volume * 0.25 + trend * 0.15);
    
    return {
      overall: Math.round(overall),
      consistency: Math.round(consistency),
      efficiency: Math.round(efficiency),
      volume: Math.round(volume),
      trend: Math.round(trend)
    };
  }
}