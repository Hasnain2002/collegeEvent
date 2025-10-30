// Simple environment variable test
import dotenv from 'dotenv';
dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Expected: supersecret');

// Test JWT signing and verification
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
console.log('Using secret:', secret);

const payload = { id: 'test123', role: 'organizer', name: 'Test User' };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('Generated token:', token);

try {
  const decoded = jwt.verify(token, secret);
  console.log('Verification successful:', decoded);
} catch (err) {
  console.log('Verification failed:', err.message);
}