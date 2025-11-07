import mysql from 'mysql2/promise';

export async function getConnection() {
  try {
    // Validate required environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('Missing DATABASE_URL configuration');
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Set session variables for security
    await connection.execute('SET SESSION sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');

    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to establish database connection');
  }
}

export async function releaseConnection(connection: any) {
  if (connection && typeof connection.end === 'function') {
    try {
      await connection.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

export async function initDatabase() {
  const connection = await getConnection();

  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subject progress table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subject_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        category VARCHAR(50),
        total_lectures INT DEFAULT 0,
        completed_lectures INT DEFAULT 0,
        total_dpps INT DEFAULT 0,
        completed_dpps INT DEFAULT 0,
        revisions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Test records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        test_type ENUM('prelims', 'mains'),
        test_category ENUM('sectional', 'full-length', 'mock', 'subjective', 'topic-wise'),
        subject VARCHAR(100),
        total_marks INT,
        scored_marks DECIMAL(5,2),
        attempt_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Current affairs progress
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS current_affairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        total_topics INT DEFAULT 300,
        completed_topics INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);

    // Essay progress
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS essay_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        lectures_completed INT DEFAULT 0,
        essays_written INT DEFAULT 0,
        total_lectures INT DEFAULT 10,
        total_essays INT DEFAULT 100,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);

    // Daily goals tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        date DATE,
        subject VARCHAR(100),
        hours_studied DECIMAL(3,1),
        topics_covered INT,
        questions_solved INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Mood tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL DEFAULT 1,
        date DATE NOT NULL,
        mood VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Optional subjects
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS optional_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        section_name VARCHAR(100),
        total_items INT DEFAULT 140,
        completed_items INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Gamification
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        prelims_questions INT DEFAULT 0,
        mains_questions INT DEFAULT 0,
        current_level VARCHAR(50) DEFAULT 'Iron',
        total_points INT DEFAULT 0,
        streak_days INT DEFAULT 0,
        last_activity DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Motivation quotes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS motivation_quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        quote TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // AI Study Plans
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

    // AI Study Tasks
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

    // AI Progress Tracking
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

    // Study Timer Sessions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        duration_minutes INT,
        session_type ENUM('focus', 'break', 'pomodoro') DEFAULT 'focus',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Notes and Flashcards
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS study_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        topic VARCHAR(200),
        content TEXT,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        subject VARCHAR(100),
        question TEXT,
        answer TEXT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        last_reviewed DATE,
        review_count INT DEFAULT 0,
        success_rate DECIMAL(3,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Question Bank
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS question_bank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(100),
        topic VARCHAR(200),
        question TEXT,
        options JSON,
        correct_answer VARCHAR(10),
        explanation TEXT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        year INT,
        exam_type ENUM('prelims', 'mains') DEFAULT 'prelims',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS question_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        question_id INT,
        selected_answer VARCHAR(10),
        is_correct BOOLEAN,
        time_taken INT,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES question_bank(id)
      )
    `);

    // Achievements and Badges
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        description TEXT,
        badge_icon VARCHAR(50),
        criteria_type ENUM('questions', 'streak', 'hours', 'tests', 'subjects') DEFAULT 'questions',
        criteria_value INT,
        points_reward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        achievement_id INT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
      )
    `);

    // Current Affairs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS current_affairs_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(300),
        content TEXT,
        category VARCHAR(100),
        importance ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        date DATE,
        source VARCHAR(200),
        source_url TEXT,
        upsc_relevance INT DEFAULT 75,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_current_affairs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        content_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        is_bookmarked BOOLEAN DEFAULT FALSE,
        notes TEXT,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (content_id) REFERENCES current_affairs_content(id)
      )
    `);

    // Smart Notifications
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        type ENUM('reminder', 'achievement', 'milestone', 'motivation') DEFAULT 'reminder',
        title VARCHAR(200),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        scheduled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // User Preferences
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        theme VARCHAR(20) DEFAULT 'dark',
        study_reminder_time TIME DEFAULT '09:00:00',
        break_reminder_interval INT DEFAULT 25,
        notification_enabled BOOLEAN DEFAULT TRUE,
        dashboard_layout JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_pref (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Study Analytics
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS study_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        date DATE,
        total_study_time INT DEFAULT 0,
        questions_solved INT DEFAULT 0,
        topics_covered INT DEFAULT 0,
        productivity_score DECIMAL(3,1) DEFAULT 0,
        focus_score DECIMAL(3,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date_analytics (user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Insert default data
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, name) VALUES (1, 'user@example.com', 'UPSC Aspirant')
    `);

    // Insert default achievements
    await connection.execute(`
      INSERT IGNORE INTO achievements (id, name, description, badge_icon, criteria_type, criteria_value, points_reward) VALUES
      (1, 'First Steps', 'Complete your first study session', '🎯', 'hours', 1, 10),
      (2, 'Question Master', 'Solve 100 questions', '📚', 'questions', 100, 50),
      (3, 'Streak Warrior', 'Maintain 7-day study streak', '🔥', 'streak', 7, 100),
      (4, 'Test Taker', 'Complete 10 tests', '📝', 'tests', 10, 75),
      (5, 'Subject Expert', 'Complete all topics in any subject', '🏆', 'subjects', 1, 200)
    `);

    console.log('Database initialized successfully with all new features');
  } finally {
    await connection.end();
  }
}