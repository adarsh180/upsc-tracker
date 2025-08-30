#!/usr/bin/env node

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

console.log('🔒 Installing security dependencies...');

try {
  // Install bcryptjs and types
  execSync('npm install bcryptjs @types/bcryptjs', { stdio: 'inherit' });
  
  console.log('✅ Security dependencies installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with the new environment variables');
  console.log('2. Generate a password hash for your admin account:');
  console.log('\n   const bcrypt = require("bcryptjs");');
  console.log('   const hash = bcrypt.hashSync("your_password", 12);');
  console.log('   console.log(hash);');
  console.log('\n3. Add the hash to your .env file as ADMIN_PASSWORD_HASH');
  console.log('4. Set ADMIN_EMAIL in your .env file');
  console.log('\n🚀 Your application is now more secure!');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}