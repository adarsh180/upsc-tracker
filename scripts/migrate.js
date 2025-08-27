const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Simple env loader
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000'),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Running migration to add completion lists...');

    // Add columns one by one to avoid syntax issues
    try {
      await connection.execute(`
        ALTER TABLE subject_progress 
        ADD COLUMN completed_lectures_list TEXT DEFAULT NULL
      `);
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) {
        throw e;
      }
    }
    
    try {
      await connection.execute(`
        ALTER TABLE subject_progress 
        ADD COLUMN completed_dpps_list TEXT DEFAULT NULL
      `);
    } catch (e) {
      if (!e.message.includes('Duplicate column name')) {
        throw e;
      }
    }

    console.log('Migration completed successfully!');

    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
    try {
      await connection?.end();
    } catch (e) {}
    process.exit(1);
  }
}

runMigration();