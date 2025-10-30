require('dotenv').config();
const jwt = require('jsonwebtoken');
const { env } = require('./src/config/env.js');

console.log('=== TOKEN DEBUGGING ===');
console.log('Environment JWT Secret:', process.env.JWT_SECRET);
console.log('Config JWT Secret:', env.jwtSecret);

// Test 1: Generate a token with the env secret
const testPayload = {
  id: 'test123',
  role: 'organizer',
  name: 'Test User',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
};

console.log('\n--- Test 1: Manual token generation ---');
const manualToken = jwt.sign(testPayload, env.jwtSecret);
console.log('Manual token generated:', manualToken);

// Test 2: Verify the manually generated token
try {
  const decoded = jwt.verify(manualToken, env.jwtSecret);
  console.log('Manual token verification: SUCCESS');
  console.log('Decoded payload:', decoded);
} catch (err) {
  console.log('Manual token verification: FAILED -', err.message);
}

// Test 3: Simulate the auth middleware verification process
function simulateAuthMiddleware(token) {
  console.log('\n--- Test 3: Simulating auth middleware ---');
  console.log('Token to verify:', token);
  console.log('Secret used for verification:', env.jwtSecret);
  
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    console.log('Middleware simulation: SUCCESS');
    console.log('Decoded payload:', decoded);
    return { success: true, user: decoded };
  } catch (err) {
    console.log('Middleware simulation: FAILED -', err.message);
    return { success: false, error: err.message };
  }
}

// Test with manual token
const manualResult = simulateAuthMiddleware(manualToken);

// Test with a known problematic token if provided
// Replace this with an actual token you're having issues with
const problematicToken = process.argv[2];
if (problematicToken) {
  console.log('\n--- Test 4: Testing problematic token ---');
  const problemResult = simulateAuthMiddleware(problematicToken);
}