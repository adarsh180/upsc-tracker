// Real-time Prediction Updates - Triggers on every progress change
import { generateAdvancedPrediction } from './advancedPredictionEngine';

export class RealTimePredictionUpdater {
  private static instance: RealTimePredictionUpdater;
  private updateQueue: Map<string, any> = new Map();
  private isProcessing = false;

  static getInstance(): RealTimePredictionUpdater {
    if (!RealTimePredictionUpdater.instance) {
      RealTimePredictionUpdater.instance = new RealTimePredictionUpdater();
    }
    return RealTimePredictionUpdater.instance;
  }

  // Triggers when user updates any progress (checkbox, test, study session)
  async onProgressUpdate(userId: string, updateType: string, updateData: any): Promise<void> {
    // Queue the update to prevent overwhelming the system
    this.updateQueue.set(`${userId}_${Date.now()}`, {
      userId,
      updateType,
      updateData,
      timestamp: Date.now()
    });

    // Process updates with debouncing (wait 2 seconds for more updates)
    setTimeout(() => this.processUpdates(userId), 2000);
  }

  private async processUpdates(userId: string): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Get all pending updates for this user
      const userUpdates = Array.from(this.updateQueue.entries())
        .filter(([key, _]) => key.startsWith(userId))
        .map(([_, update]) => update);

      if (userUpdates.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Fetch latest user data
      const userProgress = await this.fetchUserProgress(userId);
      const historicalData = await this.fetchHistoricalData(userId);

      // Generate new prediction
      const newPrediction = generateAdvancedPrediction(userProgress, historicalData);

      // Store updated prediction
      await this.storePrediction(userId, newPrediction);

      // Clear processed updates
      userUpdates.forEach(update => {
        const key = `${userId}_${update.timestamp}`;
        this.updateQueue.delete(key);
      });

      console.log(`Prediction updated for user ${userId} at ${new Date().toISOString()}`);

    } catch (error) {
      console.error('Error processing prediction update:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async fetchUserProgress(userId: string): Promise<any> {
    // This will be called by your existing API
    // Returns current user progress from all tables
    return {
      user_id: userId,
      completion: 0, // Will be calculated from actual data
      accuracy: 0,   // Will be calculated from actual data
      testPerformance: 0, // Will be calculated from actual data
      category: 'general' // From user profile
    };
  }

  private async fetchHistoricalData(userId: string): Promise<any[]> {
    // Fetch last 100 data points for trend analysis
    // This includes: study sessions, test records, question attempts, mood entries
    return []; // Will be populated with real data
  }

  private async storePrediction(userId: string, prediction: any): Promise<void> {
    // Store in database for quick retrieval
    // This ensures the prediction API returns updated results immediately
    console.log('Storing prediction:', prediction);
  }
}

// Performance Metrics Tracker
export class PerformanceMetricsTracker {
  // Track real performance indicators
  static calculateRealTimeMetrics(recentData: any[]): any {
    if (recentData.length === 0) return this.getDefaultMetrics();

    const last7Days = recentData.filter(d => 
      Date.now() - new Date(d.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    const last30Days = recentData.filter(d => 
      Date.now() - new Date(d.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
    );

    return {
      studyConsistency: this.calculateStudyConsistency(last7Days),
      accuracyTrend: this.calculateAccuracyTrend(last30Days),
      speedImprovement: this.calculateSpeedImprovement(last30Days),
      retentionRate: this.calculateRetentionRate(recentData),
      burnoutRisk: this.calculateBurnoutRisk(last7Days),
      peakPerformanceHours: this.identifyPeakHours(recentData)
    };
  }

  private static calculateStudyConsistency(data: any[]): number {
    if (data.length < 7) return 0.3; // Insufficient data penalty

    const dailyStudyHours = new Array(7).fill(0);
    data.forEach(d => {
      const dayIndex = new Date(d.timestamp).getDay();
      dailyStudyHours[dayIndex] += d.duration_minutes / 60 || 0;
    });

    const studyDays = dailyStudyHours.filter(hours => hours > 0).length;
    const avgHours = dailyStudyHours.reduce((sum, h) => sum + h, 0) / 7;
    const variance = dailyStudyHours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / 7;

    // Consistency = (study days / 7) * (1 - normalized variance)
    return (studyDays / 7) * Math.max(0.3, 1 - Math.sqrt(variance) / (avgHours + 1));
  }

  private static calculateAccuracyTrend(data: any[]): number {
    const accuracyData = data.filter(d => d.accuracy !== undefined).map(d => d.accuracy);
    if (accuracyData.length < 5) return 0.5;

    const recent = accuracyData.slice(0, Math.ceil(accuracyData.length / 2));
    const older = accuracyData.slice(Math.ceil(accuracyData.length / 2));

    const recentAvg = recent.reduce((sum, a) => sum + a, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a, 0) / older.length;

    return Math.max(0, Math.min(1, 0.5 + (recentAvg - olderAvg) / 100));
  }

  private static calculateSpeedImprovement(data: any[]): number {
    const speedData = data.filter(d => d.time_taken !== undefined);
    if (speedData.length < 10) return 0.5;

    // Lower time_taken = better speed
    const recent = speedData.slice(0, Math.ceil(speedData.length / 2));
    const older = speedData.slice(Math.ceil(speedData.length / 2));

    const recentAvg = recent.reduce((sum, s) => sum + s.time_taken, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.time_taken, 0) / older.length;

    // Improvement if recent time is less than older time
    return Math.max(0, Math.min(1, 0.5 + (olderAvg - recentAvg) / olderAvg));
  }

  private static calculateRetentionRate(data: any[]): number {
    // Analyze revision patterns and retention
    const revisionData = data.filter(d => d.revision_count !== undefined);
    if (revisionData.length === 0) return 0.4;

    const avgRevisions = revisionData.reduce((sum, r) => sum + r.revision_count, 0) / revisionData.length;
    return Math.min(1, avgRevisions / 3); // 3 revisions = 100% retention
  }

  private static calculateBurnoutRisk(data: any[]): number {
    if (data.length === 0) return 0.5;

    const totalHours = data.reduce((sum, d) => sum + (d.duration_minutes / 60 || 0), 0);
    const avgDailyHours = totalHours / 7;

    // Risk factors
    const overworkRisk = avgDailyHours > 12 ? 0.8 : avgDailyHours > 10 ? 0.6 : 0.3;
    const consistencyRisk = this.calculateStudyConsistency(data) < 0.5 ? 0.7 : 0.3;
    const moodData = data.filter(d => d.mood && d.mood.toLowerCase().includes('bad'));
    const moodRisk = moodData.length / data.length;

    return Math.min(1, (overworkRisk + consistencyRisk + moodRisk) / 3);
  }

  private static identifyPeakHours(data: any[]): number[] {
    const hourlyPerformance = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    data.forEach(d => {
      if (d.timestamp && d.performance) {
        const hour = new Date(d.timestamp).getHours();
        hourlyPerformance[hour] += d.performance;
        hourlyCounts[hour]++;
      }
    });

    // Calculate average performance for each hour
    const avgPerformance = hourlyPerformance.map((total, i) => 
      hourlyCounts[i] > 0 ? total / hourlyCounts[i] : 0
    );

    // Find top 3 performing hours
    return avgPerformance
      .map((perf, hour) => ({ hour, performance: perf }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private static getDefaultMetrics(): any {
    return {
      studyConsistency: 0.5,
      accuracyTrend: 0.5,
      speedImprovement: 0.5,
      retentionRate: 0.4,
      burnoutRisk: 0.5,
      peakPerformanceHours: [9, 15, 21] // Default peak hours
    };
  }
}

// Integration hook for your existing progress update functions
export function triggerPredictionUpdate(userId: string, updateType: string, updateData: any): void {
  const updater = RealTimePredictionUpdater.getInstance();
  updater.onProgressUpdate(userId, updateType, updateData);
}