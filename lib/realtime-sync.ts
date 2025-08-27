// Real-time data synchronization utilities
export class RealtimeSync {
  private static instance: RealtimeSync;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  // Subscribe to real-time updates for a specific data type
  subscribe(dataType: string, callback: (data: any) => void, intervalMs: number = 30000) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    
    this.subscribers.get(dataType)!.push(callback);

    // Start polling if this is the first subscriber
    if (this.subscribers.get(dataType)!.length === 1) {
      this.startPolling(dataType, intervalMs);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        
        // Stop polling if no more subscribers
        if (callbacks.length === 0) {
          this.stopPolling(dataType);
        }
      }
    };
  }

  private startPolling(dataType: string, intervalMs: number) {
    const interval = setInterval(async () => {
      try {
        let data;
        
        switch (dataType) {
          case 'goals-analytics':
            const [basicResponse, advancedResponse] = await Promise.all([
              fetch('/api/goals/analytics'),
              fetch('/api/goals/advanced-analytics')
            ]);
            
            const basicData = await basicResponse.json();
            const advancedData = await advancedResponse.json();
            
            data = { ...basicData, ...advancedData };
            break;
            
          case 'subjects-progress':
            const subjectsResponse = await fetch('/api/subjects');
            data = await subjectsResponse.json();
            break;
            
          default:
            console.warn(`Unknown data type: ${dataType}`);
            return;
        }

        // Notify all subscribers
        const callbacks = this.subscribers.get(dataType);
        if (callbacks) {
          callbacks.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error(`Error fetching ${dataType}:`, error);
      }
    }, intervalMs);

    this.intervals.set(dataType, interval);
  }

  private stopPolling(dataType: string) {
    const interval = this.intervals.get(dataType);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(dataType);
    }
  }

  // Manually trigger an update
  async triggerUpdate(dataType: string) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks && callbacks.length > 0) {
      // Temporarily stop polling to avoid conflicts
      this.stopPolling(dataType);
      
      try {
        let data;
        
        switch (dataType) {
          case 'goals-analytics':
            const [basicResponse, advancedResponse] = await Promise.all([
              fetch('/api/goals/analytics'),
              fetch('/api/goals/advanced-analytics')
            ]);
            
            const basicData = await basicResponse.json();
            const advancedData = await advancedResponse.json();
            
            data = { ...basicData, ...advancedData };
            break;
            
          default:
            return;
        }

        callbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error(`Error in manual update for ${dataType}:`, error);
      }
      
      // Restart polling
      this.startPolling(dataType, 30000);
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
  }
}

// Hook for React components
export function useRealtimeData(dataType: string, initialData: any = null, intervalMs: number = 30000) {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const sync = RealtimeSync.getInstance();
    
    const unsubscribe = sync.subscribe(
      dataType,
      (newData) => {
        setData(newData);
        setLoading(false);
        setError(null);
      },
      intervalMs
    );

    // Initial fetch if no initial data
    if (!initialData) {
      sync.triggerUpdate(dataType).catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }

    return unsubscribe;
  }, [dataType, intervalMs]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    RealtimeSync.getInstance().triggerUpdate(dataType);
  }, [dataType]);

  return { data, loading, error, refresh };
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  static getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static getMetricTrend(name: string): 'up' | 'down' | 'stable' {
    const values = this.metrics.get(name);
    if (!values || values.length < 2) return 'stable';
    
    const recent = values.slice(-10);
    const previous = values.slice(-20, -10);
    
    if (recent.length === 0 || previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    const threshold = 0.05; // 5% threshold
    const change = (recentAvg - previousAvg) / previousAvg;
    
    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }
}

// Add React import for the hook
import React from 'react';