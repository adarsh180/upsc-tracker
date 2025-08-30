const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initializeAITables() {
  let connection;
  
  try {
    console.log('🚀 Initializing AI Study Assistant tables...');
    
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
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
    console.log('✅ ai_study_plans table created');

    // Create AI study tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_study_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        plan_id INT,
        subject VARCHAR(200),
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
    console.log('✅ ai_study_tasks table created');

    // Create AI progress tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_progress_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        plan_id INT,
        subject VARCHAR(200),
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
    console.log('✅ ai_progress_tracking table created');

    console.log('🎉 AI Study Assistant tables initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing AI tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeAITables();