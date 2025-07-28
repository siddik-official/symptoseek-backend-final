#!/usr/bin/env node

// Generate a secure JWT secret for your application
const crypto = require('crypto');

console.log('\n🔐 Generated JWT Secret:');
console.log('=' .repeat(80));
console.log(crypto.randomBytes(64).toString('hex'));
console.log('=' .repeat(80));
console.log('\n📋 Copy this secret and use it as your JWT_SECRET environment variable');
console.log('⚠️  Keep this secret secure and never commit it to version control!\n');
