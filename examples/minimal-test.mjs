#!/usr/bin/env node
// Minimal test for individual functions

import { generateSS58Address, ss58DecodePublicKey } from '../dist/index.js';
import { randomBytes } from 'crypto';

async function minimalTest() {
  console.log('🧪 Minimal Test\n');

  try {
    // Test 1: Generate SS58 address
    const publicKey = randomBytes(32);
    console.log('📝 Public key:', publicKey.toString('hex'));

    const ss58Address = generateSS58Address(publicKey);
    console.log('🆔 Generated SS58:', ss58Address);

    // Test 2: Decode SS58 address
    console.log('\n🔍 Testing SS58 decode...');
    const decodedPubKey = ss58DecodePublicKey(ss58Address);
    console.log('🔓 Decoded public key:', decodedPubKey.toString('hex'));

    // Test 3: Compare
    const matches = publicKey.equals(decodedPubKey);
    console.log('✅ Keys match:', matches);

  } catch (error) {
    console.error('💥 Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

minimalTest();
