// Test the generateToken function
require('dotenv').config();
const { env } = require('./src/config/env.js');
const { generateJwtToken } = require('./src/utils/generateToken.js');

console.log('JWT Secret from env:', env.jwtSecret);

// Generate a token using the same function as the application
const payload = {
  id: '68ef53336af41f383563f89e',
  role: 'organizer',
  name: 'Oscar Organizer'
};

const token = generateJwtToken(payload);
console.log('\nGenerated token:', token);

// Verify the token
const jwt = require('jsonwebtoken');
try {
  const decoded = jwt.verify(token, env.jwtSecret);
  console.log('Token is valid. Decoded:', decoded);
} catch (err) {
  console.log('Token verification failed:', err.message);
}