#!/usr/bin/env node
// Debug SS58 address generation and verification

import { generateToken, verifyToken } from '../dist/index.js';
import { randomBytes } from 'crypto';

async function debugTest() {
  console.log('🔧 Debug Test for SS58 Address Generation\n');

  try {
    // 1. Generate a simple private key
    const privateKey = randomBytes(32);
    console.log('🔑 Private key:', privateKey.toString('hex'));

    // 2. Generate token
    const token = generateToken({
      privateKey,
      issuer: 'sensespace',
      expiresIn: 60 * 60, // 1 hour
    });

    console.log('📝 Generated token:', token);

    // 3. Parse the JWT manually to see the subject
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    console.log('📄 Token payload:', payload);
    console.log('🆔 Subject (SS58):', payload.sub);

    // 4. Try to verify
    console.log('\n🔍 Attempting verification...');
    const result = await verifyToken(token, {
      allowedIssuers: ['sensespace']
    });

    console.log('✅ Result:', result);

  } catch (error) {
    console.error('💥 Debug failed:', error);
    console.error('Stack:', error.stack);
  }
}

debugTest();
