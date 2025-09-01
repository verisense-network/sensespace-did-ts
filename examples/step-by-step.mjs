#!/usr/bin/env node
// Test JWT verification step by step

import { splitJWT, ss58DecodePublicKey, validateTokenTimes } from '../dist/index.js';

async function stepByStepTest() {
  console.log('🔬 Step by Step JWT Verification Test\n');

  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIweDQ0M2I1M2RmMTYyOTg4YzBhYTQ3MWQ2MTkxYzkzOTJkMmRkYzc4Njk5OWE4ZGY2YTEyM2Q5M2RkOTc0NDViN2MiLCJleHAiOjE3NTY3Mzg3MTUsImlhdCI6MTc1NjY1MjMxNSwiaXNzIjoic2Vuc2VzcGFjZS1iYWNrZW5kIiwiYXV0aFR5cGUiOiJ3YWxsZXQifQ.CioIGz-3tu0HhRWZix8PB2OGlqLkGQN-X08sIRoc1cI";

  try {
    // Step 1: Split JWT
    console.log('1️⃣ Splitting JWT...');
    const [header, payload, signatureBytes] = splitJWT(token);
    console.log('   Header:', header);
    console.log('   Payload:', payload);
    console.log('   Signature length:', signatureBytes.length);

    // Step 2: Extract subject
    console.log('\n2️⃣ Extracting subject...');
    const sub = payload.sub;
    console.log('   Subject:', sub);

    // Step 3: Decode SS58
    console.log('\n3️⃣ Decoding SS58...');
    const publicKeyBytes = ss58DecodePublicKey(sub);
    console.log('   Public key:', publicKeyBytes.toString('hex'));

    // Step 4: Validate timestamps
    console.log('\n4️⃣ Validating timestamps...');
    validateTokenTimes(payload);
    console.log('   ✅ Timestamps valid');

    // Step 5: Try ed25519 verification
    console.log('\n5️⃣ Testing Ed25519 verification...');
    const ed25519 = await import('@noble/ed25519');

    const [encodedHeader, encodedPayload] = token.split('.').slice(0, 2);
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signingInputBytes = new TextEncoder().encode(signingInput);

    console.log('   Signing input length:', signingInputBytes.length);
    console.log('   Public key length:', publicKeyBytes.length);
    console.log('   Signature length:', signatureBytes.length);

    const isValid = await ed25519.verify(
      signatureBytes,
      signingInputBytes,
      publicKeyBytes
    );

    console.log('   ✅ Signature valid:', isValid);

  } catch (error) {
    console.error('💥 Step failed:', error);
    console.error('Stack:', error.stack);
  }
}

stepByStepTest();
