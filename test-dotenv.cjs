// Test to check if dotenv is loading correctly from the current directory
const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('Environment variables before dotenv:', Object.keys(process.env).filter(key => key.includes('JWT')).length);

// Check if .env file exists in current directory
const envPath = path.join(process.cwd(), '.env');
console.log('.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content:');
  console.log(envContent);
}

// Load dotenv
require('dotenv').config();

console.log('Environment variables after dotenv:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Test if the variables are properly loaded
if (process.env.JWT_SECRET === 'supersecret') {
  console.log('✅ JWT_SECRET loaded correctly');
} else {
  console.log('❌ JWT_SECRET not loaded correctly');
}