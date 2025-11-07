// Personalized AI Suggestions Engine - Learns from your patterns
export class PersonalizedSuggestionsEngine {
  // Generate daily personalized suggestions based on your history
  static generateDailySuggestions(userHistory: any, currentProgress: any, timeToExam: number): any {
    const suggestions = {
      priority: this.getPriorityTasks(userHistory, currentProgress, timeToExam),
      studyPlan: this.generateStudyPlan(userHistory, currentProgress),
      weaknessTargeting: this.getWeaknessTargeting(userHistory),
      strengthLeveraging: this.getStrengthLeveraging(userHistory),
      timeOptimization: this.getTimeOptimization(userHistory),
      motivational: this.getMotivationalSuggestions(userHistory, currentProgress),
      examStrategy: this.getExamStrategy(timeToExam, currentProgress)
    };

    return suggestions;
  }

  private static getPriorityTasks(history: any, progress: any, timeToExam: number): string[] {
    const tasks = [];
    
    // Critical timeline-based priorities
    if (timeToExam < 90) {
      tasks.push("🚨 CRITICAL: Focus only on revision and mock tests - no new topics");
      tasks.push("📝 Daily full-length test practice - build exam temperament");
    } else if (timeToExam < 180) {
      tasks.push("⚡ URGENT: Complete remaining syllabus within 30 days");
      tasks.push("🔄 Start intensive revision cycle for completed topics");
    }

    // Subject-specific priorities based on weakness
    const weakestSubjects = history.subjectWiseAnalysis?.filter((s: any) => s.overallScore < 60) || [];
    weakestSubjects.slice(0, 2).forEach((subject: any) => {
      tasks.push(`🎯 HIGH PRIORITY: ${subject.subject} needs immediate attention (${subject.overallScore}%)`);
    });

    // Test performance priorities
    if (history.testPerformance?.trend === 'declining') {
      tasks.push("📉 ALERT: Test performance declining - review study methods");
    }

    // Revision priorities
    const lowRevisionSubjects = history.revisionEffectiveness?.subjectWiseRevisions?.filter((s: any) => s.revisions < 2) || [];
    if (lowRevisionSubjects.length > 0) {
      tasks.push(`🔁 REVISION NEEDED: ${lowRevisionSubjects.map((s: any) => s.subject).join(', ')}`);
    }

    return tasks.slice(0, 6); // Top 6 priorities
  }

  private static generateStudyPlan(history: any, progress: any): any {
    const peakHours = history.timePatterns?.peakHours || [{ hour: 9 }, { hour: 15 }, { hour: 21 }];
    const weakSubjects = history.subjectWiseAnalysis?.filter((s: any) => s.overallScore < 60) || [];
    const strongSubjects = history.subjectWiseAnalysis?.filter((s: any) => s.overallScore > 75) || [];

    return {
      morningSession: {
        time: `${peakHours[0]?.hour || 9}:00 - ${(peakHours[0]?.hour || 9) + 3}:00`,
        focus: weakSubjects[0]?.subject || "Most challenging subject",
        activities: ["New topic reading", "Concept clarity", "Note making"],
        reason: "Peak cognitive hours for difficult subjects"
      },
      afternoonSession: {
        time: `${peakHours[1]?.hour || 15}:00 - ${(peakHours[1]?.hour || 15) + 2}:00`,
        focus: "Practice & Tests",
        activities: ["Mock tests", "Previous year questions", "Speed practice"],
        reason: "Good focus time for application-based learning"
      },
      eveningSession: {
        time: `${peakHours[2]?.hour || 21}:00 - ${(peakHours[2]?.hour || 21) + 2}:00`,
        focus: strongSubjects[0]?.subject || "Revision",
        activities: ["Revision", "Current affairs", "Light reading"],
        reason: "Consolidation and easy topics for evening"
      },
      weeklyPattern: this.generateWeeklyPattern(history, weakSubjects, strongSubjects)
    };
  }

  private static generateWeeklyPattern(history: any, weakSubjects: any[], strongSubjects: any[]): any {
    const pattern = {
      Monday: { focus: "Week planning + Weak subject 1", intensity: "High" },
      Tuesday: { focus: "Weak subject 1 continuation", intensity: "High" },
      Wednesday: { focus: "Tests + Weak subject 2", intensity: "Medium" },
      Thursday: { focus: "Weak subject 2 continuation", intensity: "High" },
      Friday: { focus: "Revision + Strong subjects", intensity: "Medium" },
      Saturday: { focus: "Full-length mock test", intensity: "High" },
      Sunday: { focus: "Analysis + Light revision", intensity: "Low" }
    };

    // Customize based on user's weekly patterns
    const userWeeklyPattern = history.timePatterns?.weeklyPattern || [];
    const bestDay = userWeeklyPattern.sort((a: any, b: any) => b.totalHours - a.totalHours)[0];
    
    if (bestDay) {
      (pattern as any)[bestDay.dayOfWeek] = { 
        focus: "Most challenging topics", 
        intensity: "Maximum",
        reason: `Your most productive day (${bestDay.totalHours}h average)`
      };
    }

    return pattern;
  }

  private static getWeaknessTargeting(history: any): any {
    const weaknesses = history.weaknesses || [];
    const topicWeaknesses = history.topicWiseAnalysis?.filter((t: any) => t.accuracy < 60) || [];
    
    return {
      immediateAction: weaknesses.slice(0, 3).map((w: any) => ({
        weakness: w,
        action: this.getActionForWeakness(w),
        timeAllocation: "30-40% of daily study time",
        measurementMetric: this.getMetricForWeakness(w)
      })),
      topicSpecific: topicWeaknesses.slice(0, 5).map((t: any) => ({
        topic: t.topic,
        currentAccuracy: `${t.accuracy}%`,
        targetAccuracy: "80%+",
        strategy: this.getTopicStrategy(t),
        practiceVolume: `${Math.max(20, 50 - t.attemptCount)} more questions needed`
      })),
      longTermPlan: this.getLongTermWeaknessStrategy(weaknesses)
    };
  }

  private static getStrengthLeveraging(history: any): any {
    const strengths = history.strengths || [];
    const strongTopics = history.topicWiseAnalysis?.filter((t: any) => t.accuracy > 80) || [];
    
    return {
      maintainExcellence: strengths.slice(0, 3).map((s: any) => ({
        strength: s,
        maintenanceStrategy: "Weekly revision + advanced questions",
        leverageOpportunity: this.getLeverageOpportunity(s)
      })),
      crossSubjectApplication: strongTopics.slice(0, 3).map((t: any) => ({
        strongTopic: t.topic,
        accuracy: `${t.accuracy}%`,
        applicationAreas: this.getCrossApplicationAreas(t.topic),
        advancedPractice: "Focus on analytical and case-based questions"
      })),
      confidenceBuilding: {
        strategy: "Start difficult study sessions with strong topics",
        reason: "Build momentum and confidence for challenging areas",
        timeAllocation: "15-20% of daily study time"
      }
    };
  }

  private static getTimeOptimization(history: any): any {
    const peakHours = history.timePatterns?.peakHours || [];
    const weeklyPattern = history.timePatterns?.weeklyPattern || [];
    
    return {
      peakPerformanceSchedule: {
        bestHours: peakHours.map((h: any) => `${h.hour}:00 - ${h.hour + 2}:00`),
        recommendation: "Schedule most difficult subjects during these hours",
        productivityBoost: "Up to 40% better retention and understanding"
      },
      weeklyOptimization: {
        mostProductiveDay: weeklyPattern[0]?.dayOfWeek || "Monday",
        leastProductiveDay: weeklyPattern[weeklyPattern.length - 1]?.dayOfWeek || "Sunday",
        suggestion: "Plan intensive study on productive days, light revision on others"
      },
      breakPatterns: {
        recommendation: "25-minute focused study + 5-minute break (Pomodoro)",
        longBreaks: "15-minute break every 2 hours",
        reason: "Based on your attention span patterns"
      },
      deadTimeUtilization: [
        "Travel time: Listen to audio lectures or current affairs",
        "Meal breaks: Quick revision of formulas/facts",
        "Before sleep: Light reading of completed topics"
      ]
    };
  }

  private static getMotivationalSuggestions(history: any, progress: any): string[] {
    const suggestions = [];
    const totalHours = history.effortMetrics?.totalStudyHours || 0;
    const preparationDays = history.preparationDays || 0;
    
    // Effort recognition
    if (totalHours > 500) {
      suggestions.push(`🏆 Amazing dedication! You've studied ${totalHours} hours - that's serious commitment!`);
    } else if (totalHours > 200) {
      suggestions.push(`💪 Great progress! ${totalHours} hours of focused study shows your determination!`);
    }

    // Consistency recognition
    if (history.effortMetrics?.consistencyScore > 80) {
      suggestions.push(`🎯 Excellent consistency! ${history.effortMetrics.consistencyScore}% study days - keep this rhythm!`);
    }

    // Progress milestones
    const avgCompletion = progress.overallCompletion || 0;
    if (avgCompletion > 80) {
      suggestions.push(`🚀 Outstanding! ${Math.round(avgCompletion)}% syllabus complete - you're in the final stretch!`);
    } else if (avgCompletion > 60) {
      suggestions.push(`📈 Solid progress! ${Math.round(avgCompletion)}% complete - momentum is building!`);
    }

    // Improvement recognition
    if (history.testPerformance?.trend === 'improving') {
      suggestions.push(`📊 Test scores improving by ${history.testPerformance.improvement}% - your hard work is paying off!`);
    }

    // Encouragement based on challenges
    const weakSubjects = history.subjectWiseAnalysis?.filter((s: any) => s.overallScore < 50) || [];
    if (weakSubjects.length > 0) {
      suggestions.push(`💡 Every UPSC topper had weak subjects initially - your persistence will overcome them!`);
    }

    // Daily motivation
    suggestions.push(`🌟 Remember: Every checkbox ticked, every question solved, every hour studied brings you closer to your IAS dream!`);
    
    return suggestions.slice(0, 4);
  }

  private static getExamStrategy(timeToExam: number, progress: any): any {
    if (timeToExam < 30) {
      return {
        phase: "Final Sprint",
        strategy: "Exam Mode Only",
        dailyRoutine: [
          "Morning: Full-length mock test",
          "Afternoon: Test analysis + weak area practice",
          "Evening: Quick revision of strong topics"
        ],
        mentalPreparation: "Focus on exam temperament and stress management",
        avoidance: "No new topics, no heavy reading"
      };
    } else if (timeToExam < 90) {
      return {
        phase: "Intensive Revision",
        strategy: "Consolidation Mode",
        dailyRoutine: [
          "Morning: Subject-wise intensive revision",
          "Afternoon: Mock tests + analysis",
          "Evening: Current affairs + light topics"
        ],
        focus: "Strengthen completed topics, quick coverage of pending areas",
        testFrequency: "Daily sectional tests + 2 full tests per week"
      };
    } else if (timeToExam < 180) {
      return {
        phase: "Completion Sprint",
        strategy: "Finish Syllabus + Start Revision",
        dailyRoutine: [
          "Morning: Complete pending topics",
          "Afternoon: Practice questions",
          "Evening: Revision of completed topics"
        ],
        urgency: "Complete 100% syllabus within 60 days",
        testFrequency: "3-4 tests per week"
      };
    } else {
      return {
        phase: "Foundation Building",
        strategy: "Comprehensive Preparation",
        dailyRoutine: [
          "Morning: New topic learning",
          "Afternoon: Practice + note making",
          "Evening: Revision + current affairs"
        ],
        focus: "Quality understanding over speed",
        testFrequency: "2-3 tests per week"
      };
    }
  }

  // Helper methods for specific recommendations
  private static getActionForWeakness(weakness: string): string {
    if (weakness.includes('accuracy')) return "Slow down, focus on concept clarity before speed";
    if (weakness.includes('completion')) return "Increase daily study hours, set weekly targets";
    if (weakness.includes('test')) return "Daily practice tests with thorough analysis";
    if (weakness.includes('revision')) return "Schedule dedicated revision slots daily";
    return "Identify root cause and create targeted practice plan";
  }

  private static getMetricForWeakness(weakness: string): string {
    if (weakness.includes('accuracy')) return "Target 80%+ accuracy in practice questions";
    if (weakness.includes('completion')) return "Complete 10% more syllabus each week";
    if (weakness.includes('test')) return "Improve test scores by 5% weekly";
    return "Track daily progress and weekly improvement";
  }

  private static getTopicStrategy(topic: any): string {
    if (topic.accuracy < 40) return "Back to basics - revise fundamental concepts";
    if (topic.accuracy < 60) return "Focused practice with immediate feedback";
    return "Advanced questions and application-based practice";
  }

  private static getLongTermWeaknessStrategy(weaknesses: string[]): string[] {
    return [
      "Create weakness-specific study schedule",
      "Track improvement weekly with measurable metrics",
      "Seek help/guidance for persistently weak areas",
      "Use multiple resources and teaching methods",
      "Regular self-assessment and strategy adjustment"
    ];
  }

  private static getLeverageOpportunity(strength: string): string {
    if (strength.includes('accuracy')) return "Attempt advanced and analytical questions";
    if (strength.includes('completion')) return "Help others, teach concepts to solidify knowledge";
    if (strength.includes('test')) return "Focus on speed and attempt more questions";
    return "Use this strength to build confidence in weak areas";
  }

  private static getCrossApplicationAreas(topic: string): string[] {
    // This would be expanded based on actual topic relationships
    const applications: { [key: string]: string[] } = {
      'polity': ['governance', 'current affairs', 'ethics'],
      'economy': ['current affairs', 'geography', 'science'],
      'history': ['culture', 'geography', 'current affairs'],
      'geography': ['environment', 'current affairs', 'economy']
    };
    
    return applications[topic.toLowerCase()] || ['current affairs', 'essay writing'];
  }
}