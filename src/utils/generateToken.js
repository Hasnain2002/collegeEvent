import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';

export function generateJwtToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

export function verifyJwtToken(token) {
  return jwt.verify(token, env.jwtSecret);
}