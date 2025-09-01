#!/usr/bin/env node
// Basic usage example for sensespace-did-ts

import { generateToken, verifyToken, SenseSpaceTokenVerifier } from '../dist/index.js';
import { randomBytes } from 'crypto';

async function main() {
  console.log('🚀 SenseSpace DID TypeScript Library Example\n');

  try {
    // 1. Generate a random Ed25519 private key (32 bytes)
    const privateKey = randomBytes(32);
    console.log('🔑 Generated private key:', privateKey.toString('hex'));

    // 2. Generate a JWT token
    const token = generateToken({
      privateKey,
      issuer: 'sensespace',
      expiresIn: 60 * 60 * 24, // 1 day
      additionalClaims: {
        custom: 'test-claim',
        permissions: ['read', 'write']
      }
    });

    console.log('📝 Generated JWT token:', token);
    console.log('');

    // 3. Verify the token
    console.log('🔍 Verifying token...');
    const result = await verifyToken(token, {
      didBaseUrl: 'https://api.sensespace.xyz/api/did/',
      allowedIssuers: ['sensespace'],
    });

    if (result.success) {
      console.log('✅ Token verified successfully!');
      console.log('📄 Claims:', JSON.stringify(result.claims, null, 2));

      if (result.didDocument) {
        console.log('🆔 DID Document:', JSON.stringify(result.didDocument, null, 2));
      } else {
        console.log('ℹ️  No DID document fetched (SS58 address may not be registered)');
      }
    } else {
      console.log('❌ Token verification failed:', result.error);
    }

    console.log('\n');

    // 4. Using the SenseSpaceTokenVerifier class
    console.log('🛠️  Using SenseSpaceTokenVerifier class:');
    const verifier = new SenseSpaceTokenVerifier({
      didBaseUrl: 'https://api.sensespace.xyz/api/did/',
      allowedIssuers: ['sensespace']
    });

    const classResult = await verifier.verify(token);
    console.log('✅ Class verification result:', classResult.success ? 'SUCCESS' : 'FAILED');

    // 5. Extract claims without verification (for debugging)
    const claims = verifier.extractClaims(token);
    console.log('🔧 Extracted claims (without verification):', claims?.sub);

    console.log('\n🎉 Example completed successfully!');

  } catch (error) {
    console.error('💥 Example failed:', error);
    process.exit(1);
  }
}

main();
