require('dotenv').config();
const jwt = require('jsonwebtoken');

// Test 1: Verify the existing token
const existingToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWY1MzMzNmFmNDFmMzgzNTYzZjg5ZSIsInJvbGUiOiJvcmdhbml6ZXIiLCJuYW1lIjoiT3NjYXIgT3JnYW5pemVyIiwiaWF0IjoxNzYwNTE1NjI4LCJleHAiOjE3NjExMjA0Mjh9.b2dm-n2X44XXsWc2I7N9NwFNaHIfs2BE2EIUdY5FTKBo';

console.log('JWT Secret from env:', process.env.JWT_SECRET);

try {
  const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
  console.log('Existing token is valid. Decoded:', decoded);
} catch (err) {
  console.log('Existing token verification failed:', err.message);
}

// Test 2: Generate a new token and verify it
const payload = {
  id: '68ef53336af41f383563f89e',
  role: 'organizer',
  name: 'Oscar Organizer'
};

const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
console.log('\nNew token generated:', newToken);

try {
  const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
  console.log('New token is valid. Decoded:', decoded);
} catch (err) {
  console.log('New token verification failed:', err.message);
}