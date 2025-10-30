require('dotenv').config();
const { protect, restrictTo } = require('./src/middleware/auth.js');
const { env } = require('./src/config/env.js');
const jwt = require('jsonwebtoken');

console.log('=== MIDDLEWARE TESTING ===');

// Create a mock request object with a valid token
const validPayload = {
  id: '68ef53336af41f383563f89e',
  role: 'organizer',
  name: 'Oscar Organizer'
};

const token = jwt.sign(validPayload, env.jwtSecret, { expiresIn: '1h' });
console.log('Test token created:', token);

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
    this.responseData = data;
    console.log(`Response status: ${this.statusCode}`);
    console.log(`Response data:`, data);
    return this;
  }
};

const mockNext = function() {
  console.log('Next middleware called successfully');
};

console.log('\n--- Testing protect middleware ---');
protect(mockReq, mockRes, mockNext);

if (mockReq.user) {
  console.log('User object set by protect middleware:', mockReq.user);
  
  console.log('\n--- Testing restrictTo middleware ---');
  const restrictMiddleware = restrictTo('organizer');
  restrictMiddleware(mockReq, mockRes, mockNext);
} else {
  console.log('Protect middleware failed to set user object');
}