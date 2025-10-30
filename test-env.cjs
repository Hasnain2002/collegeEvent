// Test what JWT secret is being used in the application
const { env } = require('./src/config/env.js');

console.log('JWT Secret from env.js:', env.jwtSecret);
console.log('All env values:', env);