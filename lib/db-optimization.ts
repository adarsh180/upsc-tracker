import { query } from './db';

export class DatabaseOptimizer {
  // Create optimized indexes for analytics queries
  static async createAnalyticsIndexes() {
    const indexes = [
      // Index for date-based queries
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals (DATE(created_at))`,
      
      // Index for efficiency calculations
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_metrics ON daily_goals (hours_studied, topics_covered, questions_solved)`,
      
      // Index for weekly aggregations
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_week ON daily_goals (YEAR(created_at), WEEK(created_at, 1))`,
      
      // Index for subject-based analytics
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_subject ON daily_goals (subject, created_at)`,
      
      // Composite index for heatmap queries
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_heatmap ON daily_goals (created_at, DAYOFWEEK(created_at))`,
      
      // Index for user-specific queries (if multi-user)
      `CREATE INDEX IF NOT EXISTS idx_daily_goals_user ON daily_goals (user_id, created_at)`,
    ];

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery);
        console.log('Created index:', indexQuery.split('idx_')[1]?.split(' ')[0]);
      } catch (error) {
        console.error('Failed to create index:', error);
      }
    }
  }

  // Optimize table structure for analytics
  static async optimizeTableStructure() {
    const optimizations = [
      // Add computed columns for common calculations
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS efficiency_score DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
          WHEN hours_studied > 0 THEN ROUND(topics_covered / hours_studied, 2)
          ELSE 0 
        END
      ) STORED`,
      
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS productivity_score DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
          WHEN hours_studied > 0 THEN ROUND(questions_solved / hours_studied, 2)
          ELSE 0 
        END
      ) STORED`,
      
      // Add date partitioning columns
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS study_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED`,
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS study_week INT GENERATED ALWAYS AS (WEEK(created_at, 1)) STORED`,
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS study_month INT GENERATED ALWAYS AS (MONTH(created_at)) STORED`,
      `ALTER TABLE daily_goals ADD COLUMN IF NOT EXISTS study_year INT GENERATED ALWAYS AS (YEAR(created_at)) STORED`,
    ];

    for (const optimization of optimizations) {
      try {
        await query(optimization);
        console.log('Applied optimization:', optimization.split('ADD COLUMN')[1]?.split(' ')[3]);
      } catch (error) {
        // Column might already exist, continue
        console.log('Optimization already applied or failed:', error);
      }
    }
  }

  // Create materialized view for common analytics queries
  static async createAnalyticsViews() {
    const views = [
      // Daily aggregated view
      `CREATE OR REPLACE VIEW daily_analytics AS
       SELECT 
         study_date,
         COUNT(*) as session_count,
         SUM(hours_studied) as total_hours,
         SUM(topics_covered) as total_topics,
         SUM(questions_solved) as total_questions,
         AVG(efficiency_score) as avg_efficiency,
         AVG(productivity_score) as avg_productivity,
         DAYOFWEEK(study_date) as day_of_week,
         WEEK(study_date, 1) as week_number
       FROM daily_goals 
       GROUP BY study_date`,
      
      // Weekly aggregated view
      `CREATE OR REPLACE VIEW weekly_analytics AS
       SELECT 
         study_year,
         study_week,
         COUNT(DISTINCT study_date) as study_days,
         COUNT(*) as total_sessions,
         SUM(total_hours) as week_hours,
         SUM(total_topics) as week_topics,
         SUM(total_questions) as week_questions,
         AVG(avg_efficiency) as week_efficiency,
         AVG(avg_productivity) as week_productivity
       FROM daily_analytics 
       GROUP BY study_year, study_week`,
      
      // Subject performance view
      `CREATE OR REPLACE VIEW subject_performance AS
       SELECT 
         subject,
         COUNT(*) as session_count,
         SUM(hours_studied) as total_hours,
         SUM(topics_covered) as total_topics,
         SUM(questions_solved) as total_questions,
         AVG(efficiency_score) as avg_efficiency,
         AVG(productivity_score) as avg_productivity,
         MAX(created_at) as last_studied
       FROM daily_goals 
       GROUP BY subject`,
    ];

    for (const viewQuery of views) {
      try {
        await query(viewQuery);
        console.log('Created view:', viewQuery.split('VIEW ')[1]?.split(' ')[0]);
      } catch (error) {
        console.error('Failed to create view:', error);
      }
    }
  }

  // Performance monitoring queries
  static async getQueryPerformance() {
    try {
      const performanceData = await query(`
        SELECT 
          'daily_goals' as table_name,
          COUNT(*) as row_count,
          AVG(CHAR_LENGTH(CONCAT(subject, notes))) as avg_row_size
        FROM daily_goals
        UNION ALL
        SELECT 
          'daily_analytics' as table_name,
          COUNT(*) as row_count,
          0 as avg_row_size
        FROM daily_analytics
      `);
      
      return performanceData;
    } catch (error) {
      console.error('Failed to get performance data:', error);
      return [];
    }
  }

  // Cache management for frequently accessed data
  static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static async getCachedData(key: string, fetcher: () => Promise<any>, ttlMs: number = 300000) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now, ttl: ttlMs });
      return data;
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn('Using expired cache due to fetch error:', error);
        return cached.data;
      }
      throw error;
    }
  }

  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Batch operations for better performance
  static async batchInsertGoals(goals: any[]) {
    if (goals.length === 0) return;

    const values = goals.map(goal => 
      `(${goal.user_id || 1}, '${goal.subject}', ${goal.hours_studied}, ${goal.topics_covered}, ${goal.questions_solved || 0}, '${goal.notes || ''}', '${goal.date}')`
    ).join(', ');

    const batchQuery = `
      INSERT INTO daily_goals (user_id, subject, hours_studied, topics_covered, questions_solved, notes, created_at)
      VALUES ${values}
    `;

    try {
      await query(batchQuery);
      this.clearCache('goals'); // Clear related cache
      return true;
    } catch (error) {
      console.error('Batch insert failed:', error);
      return false;
    }
  }

  // Database maintenance
  static async performMaintenance() {
    const maintenanceTasks = [
      // Analyze tables for query optimization
      'ANALYZE TABLE daily_goals',
      
      // Clean up old temporary data (if any)
      `DELETE FROM daily_goals WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR)`,
      
      // Update table statistics
      'OPTIMIZE TABLE daily_goals',
    ];

    const results = [];
    for (const task of maintenanceTasks) {
      try {
        await query(task);
        results.push({ task, status: 'success' });
      } catch (error) {
        results.push({ task, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  // Initialize all optimizations
  static async initialize() {
    console.log('Initializing database optimizations...');
    
    try {
      await this.createAnalyticsIndexes();
      await this.optimizeTableStructure();
      await this.createAnalyticsViews();
      
      console.log('Database optimization complete');
      return true;
    } catch (error) {
      console.error('Database optimization failed:', error);
      return false;
    }
  }
}

// Query builder for complex analytics
export class AnalyticsQueryBuilder {
  private conditions: string[] = [];
  private groupBy: string[] = [];
  private orderBy: string[] = [];
  private limit?: number;

  static create() {
    return new AnalyticsQueryBuilder();
  }

  dateRange(startDate: string, endDate: string) {
    this.conditions.push(`study_date BETWEEN '${startDate}' AND '${endDate}'`);
    return this;
  }

  subject(subject: string) {
    this.conditions.push(`subject = '${subject}'`);
    return this;
  }

  minHours(hours: number) {
    this.conditions.push(`hours_studied >= ${hours}`);
    return this;
  }

  groupByDate() {
    this.groupBy.push('study_date');
    return this;
  }

  groupBySubject() {
    this.groupBy.push('subject');
    return this;
  }

  orderByDate(direction: 'ASC' | 'DESC' = 'DESC') {
    this.orderBy.push(`study_date ${direction}`);
    return this;
  }

  limitResults(count: number) {
    this.limit = count;
    return this;
  }

  buildEfficiencyQuery() {
    let query = `
      SELECT 
        study_date,
        subject,
        SUM(hours_studied) as total_hours,
        SUM(topics_covered) as total_topics,
        SUM(questions_solved) as total_questions,
        AVG(efficiency_score) as avg_efficiency,
        AVG(productivity_score) as avg_productivity
      FROM daily_goals
    `;

    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    if (this.groupBy.length > 0) {
      query += ` GROUP BY ${this.groupBy.join(', ')}`;
    }

    if (this.orderBy.length > 0) {
      query += ` ORDER BY ${this.orderBy.join(', ')}`;
    }

    if (this.limit) {
      query += ` LIMIT ${this.limit}`;
    }

    return query;
  }

  buildHeatmapQuery() {
    let query = `
      SELECT 
        study_date,
        DAYOFWEEK(study_date) as day_of_week,
        WEEK(study_date, 1) as week_number,
        SUM(hours_studied) as hours,
        SUM(topics_covered) as topics,
        SUM(questions_solved) as questions
      FROM daily_goals
    `;

    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    query += ` GROUP BY study_date, DAYOFWEEK(study_date), WEEK(study_date, 1)`;

    if (this.orderBy.length > 0) {
      query += ` ORDER BY ${this.orderBy.join(', ')}`;
    }

    return query;
  }
}