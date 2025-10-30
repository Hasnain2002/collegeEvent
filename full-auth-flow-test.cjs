// Test that replicates the exact auth flow in your application
const express = require('express');
const { env } = require('./src/config/env.js');
const { generateJwtToken } = require('./src/utils/generateToken.js');
const jwt = require('jsonwebtoken');

console.log('=== Environment Setup ===');
console.log('JWT Secret:', env.jwtSecret);

// Create a test user payload (similar to what would happen in login)
const userPayload = { 
  id: 'test123', 
  role: 'organizer', 
  name: 'Test User' 
};

console.log('\n=== Token Generation (as in login) ===');
const token = generateJwtToken(userPayload);
console.log('Generated Token:', token);

// Now test the exact verification process as in auth.js middleware
console.log('\n=== Token Verification (as in auth.js) ===');
console.log('Using secret from env.jwtSecret:', env.jwtSecret);

try {
  const decoded = jwt.verify(token, env.jwtSecret);
  console.log('✅ Token verification successful!');
  console.log('Decoded payload:', decoded);
} catch (err) {
  console.log('❌ Token verification failed!');
  console.log('Error:', err.message);
  console.log('Error name:', err.name);
}

// Test the exact authenticate function logic
console.log('\n=== Testing Authenticate Function Logic ===');
function authenticate(token) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return { success: true, user: decoded };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const result = authenticate(token);
console.log('Authenticate function result:', result);

// Let's also test what happens if we use a different secret
console.log('\n=== Testing with Wrong Secret ===');
try {
  const wrongDecoded = jwt.verify(token, 'wrongsecret');
  console.log('Wrong secret verification (unexpected success):', wrongDecoded);
} catch (err) {
  console.log('Wrong secret verification (expected failure):', err.message);
}