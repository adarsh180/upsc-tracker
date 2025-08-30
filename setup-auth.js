const bcrypt = require('bcryptjs');
const fs = require('fs');

// Your existing credentials
const ADMIN_EMAIL = 'tiwariadarsh0704@gmail.com';
const ADMIN_PASSWORD = 'Adarsh0704$';

console.log('🔒 Setting up secure authentication...');

// Generate password hash
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);

// Generate random secret
const secret = require('crypto').randomBytes(32).toString('hex');

// Create .env content
const envContent = `# Database Configuration (keep your existing values)
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=upsc_tracker

# Groq AI API (keep your existing value)
GROQ_API_KEY=your_groq_api_key

# Authentication (REQUIRED - Generated automatically)
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD_HASH=${passwordHash}

# Security
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${secret}
`;

// Write to .env file
fs.writeFileSync('.env', envContent);

console.log('✅ Authentication setup complete!');
console.log('📧 Admin Email:', ADMIN_EMAIL);
console.log('🔑 Password: (unchanged) Adarsh0704$');
console.log('📝 .env file created with secure hash');
console.log('\n⚠️  IMPORTANT: Update the database and API key values in .env with your actual values!');
console.log('\n🚀 You can now login with your existing credentials!');