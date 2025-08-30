import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();

    // Create AI study plans table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_study_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subjects JSON,
        timeline_days INT,
        monthly_goals JSON,
        questions_per_day INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create AI study tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_study_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        plan_id INT,
        subject VARCHAR(100),
        task_type ENUM('lecture', 'practice', 'revision', 'test', 'current_affairs'),
        task_description TEXT,
        target_date DATE,
        estimated_hours DECIMAL(3,1),
        questions_count INT DEFAULT 0,
        status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES ai_study_plans(id)
      )
    `);

    // Create AI progress tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_progress_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        plan_id INT,
        subject VARCHAR(100),
        original_target_days INT,
        current_target_days INT,
        actual_days_taken INT DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        performance_score DECIMAL(3,1) DEFAULT 0,
        weak_areas JSON,
        strong_areas JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES ai_study_plans(id)
      )
    `);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'AI Study Assistant tables created successfully'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database tables' },
      { status: 500 }
    );
  }
}