// Test to check if there's a difference in how env is loaded in the application context
const { env } = require('./src/config/env.js');

console.log('=== Application Environment Test ===');
console.log('JWT Secret:', env.jwtSecret);
console.log('All env variables:', {
  jwtSecret: env.jwtSecret,
  mongoUri: env.mongoUri,
  port: env.port
});

// Import the actual middleware to test it
const { authenticate } = require('./src/middleware/auth.js');

// Create a mock request object with a valid token
const jwt = require('jsonwebtoken');
const { generateJwtToken } = require('./src/utils/generateToken.js');

const userPayload = { 
  id: 'test123', 
  role: 'organizer', 
  name: 'Test User' 
};

const token = generateJwtToken(userPayload);
console.log('\nGenerated Token:', token);

// Test the actual authenticate middleware function
console.log('\n=== Testing Actual Authenticate Middleware ===');

const mockReq = {
  headers: {
    authorization: `Bearer ${token}`
  }
};

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

let nextCalled = false;
const mockNext = function() {
  nextCalled = true;
};

// Call the actual authenticate function
authenticate(mockReq, mockRes, mockNext);

console.log('Response Status:', mockRes.statusCode);
console.log('Response Body:', mockRes.body);
console.log('Next Called:', nextCalled);

if (nextCalled) {
  console.log('✅ Authentication middleware passed successfully!');
} else {
  console.log('❌ Authentication middleware failed!');
}