const { env } = require('./src/config/env.js');

console.log('Environment Variables:');
console.log('JWT Secret:', env.jwtSecret);
console.log('Mongo URI:', env.mongoUri);
console.log('Port:', env.port);

// Test token generation and verification
const jwt = require('jsonwebtoken');

const payload = { id: 'test123', role: 'organizer', name: 'Test User' };
const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '1h' });
console.log('\nGenerated Token:', token);

try {
  const decoded = jwt.verify(token, env.jwtSecret);
  console.log('\nToken Verification Success:', decoded);
} catch (err) {
  console.log('\nToken Verification Error:', err.message);
}