// Full authentication flow test
require('dotenv').config();

console.log('=== Environment Variables ===');
console.log('JWT_SECRET from process.env:', process.env.JWT_SECRET);
console.log('Expected JWT Secret: supersecret');

const { env } = require('./src/config/env.js');
console.log('Loaded env.jwtSecret:', env.jwtSecret);

// Test imports
const jwt = require('jsonwebtoken');
const { generateJwtToken } = require('./src/utils/generateToken.js');

console.log('\n=== Token Generation Test ===');
const testPayload = { 
  id: 'test123', 
  role: 'organizer', 
  name: 'Test User' 
};

console.log('Using secret for signing:', env.jwtSecret);
const token = generateJwtToken(testPayload);
console.log('Generated Token:', token);

console.log('\n=== Token Verification Test ===');
console.log('Using secret for verification:', env.jwtSecret);

try {
  // Direct verification with the secret
  const directVerify = jwt.verify(token, env.jwtSecret);
  console.log('Direct verification result:', directVerify);
  
  // Using our utility function
  const utilVerify = require('./src/utils/generateToken.js').verifyJwtToken(token);
  console.log('Utility function verification result:', utilVerify);
  
  console.log('\n✅ Token generation and verification successful!');
} catch (err) {
  console.log('❌ Token verification failed:', err.message);
  console.log('Error name:', err.name);
}