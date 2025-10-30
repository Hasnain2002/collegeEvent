// Test the authentication middleware
require('dotenv').config();
const { env } = require('./src/config/env.js');
const jwt = require('jsonwebtoken');

console.log('JWT Secret from env:', env.jwtSecret);

// Generate a token using the same secret as the middleware
const payload = {
  id: '68ef53336af41f383563f89e',
  role: 'organizer',
  name: 'Oscar Organizer'
};

const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
console.log('\nGenerated token:', token);

// Test the verification using the same method as the middleware
try {
  const decoded = jwt.verify(token, env.jwtSecret);
  console.log('Token verification successful. Decoded:', decoded);
} catch (err) {
  console.log('Token verification failed:', err.message);
}