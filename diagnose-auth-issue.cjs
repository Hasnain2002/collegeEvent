// Comprehensive diagnostic test for the authentication issue
const express = require('express');
const { env } = require('./src/config/env.js');
const jwt = require('jsonwebtoken');
const { generateJwtToken } = require('./src/utils/generateToken.js');

console.log('=== AUTHENTICATION ISSUE DIAGNOSTIC ===\n');

// 1. Check environment variables
console.log('1. Environment Variables Check');
console.log('   JWT_SECRET from .env file:', process.env.JWT_SECRET);
console.log('   env.jwtSecret from config:', env.jwtSecret);
console.log('   Are they equal?', process.env.JWT_SECRET === env.jwtSecret);

// 2. Test token generation
console.log('\n2. Token Generation Test');
const testUser = { id: 'user123', role: 'organizer', name: 'Test User' };
const token = generateJwtToken(testUser);
console.log('   Generated token:', token.substring(0, 50) + '...');

// 3. Test token verification with the exact same secret
console.log('\n3. Token Verification Test');
console.log('   Using secret for verification:', env.jwtSecret);

try {
  const decoded = jwt.verify(token, env.jwtSecret);
  console.log('   ✅ Token verification successful');
  console.log('   Decoded payload:', decoded);
} catch (err) {
  console.log('   ❌ Token verification failed:', err.message);
}

// 4. Test the actual authenticate middleware function
console.log('\n4. Authenticate Middleware Test');
const { authenticate } = require('./src/middleware/auth.js');

// Mock request with the token
const mockReq = {
  headers: {
    authorization: `Bearer ${token}`
  }
};

// Mock response object
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.body = data;
    return this;
  }
};

// Mock next function
let nextCalled = false;
const mockNext = function() {
  nextCalled = true;
};

console.log('   Calling authenticate middleware...');
authenticate(mockReq, mockRes, mockNext);

console.log('   Response status:', mockRes.statusCode);
console.log('   Response body:', mockRes.body);
console.log('   Next function called:', nextCalled);

if (nextCalled) {
  console.log('   ✅ Authenticate middleware passed');
} else {
  console.log('   ❌ Authenticate middleware failed');
  if (mockRes.body && mockRes.body.message) {
    console.log('   Error message:', mockRes.body.message);
  }
}

// 5. Additional diagnostics
console.log('\n5. Additional Diagnostics');

// Check if there are multiple instances of env
console.log('   Checking for multiple env instances...');
const env1 = require('./src/config/env.js');
const env2 = require('./src/config/env.js');
console.log('   Are env instances the same?', env1 === env2);

// Check JWT library version
console.log('   JWT library version:', require('jsonwebtoken/package.json').version);

console.log('\n=== DIAGNOSTIC COMPLETE ===');

// Final summary
if (nextCalled) {
  console.log('\n🎉 All tests passed! The authentication system works correctly in isolation.');
  console.log('   The issue is likely related to:');
  console.log('   - Server not being properly restarted');
  console.log('   - Module caching issues');
  console.log('   - Environment variables not being loaded in the running server');
} else {
  console.log('\n❌ There is an issue with the authentication system.');
  console.log('   Please check the error messages above.');
}