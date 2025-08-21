import mysql from 'mysql2/promise';

export async function getConnection() {
  return await mysql.createConnection(process.env.DATABASE_URL!);
}

export function releaseConnection(connection: any) {
  if (connection && connection.end) {
    connection.end();
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

    // Insert default user
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, name) VALUES (1, 'user@example.com', 'UPSC Aspirant')
    `);

    console.log('Database initialized successfully');
  } finally {
    await connection.end();
  }
}