import * as jwt from 'jsonwebtoken';
import * as ed25519 from '@noble/ed25519';
import { createHash } from 'crypto';
import { VerifyTokenResult, GenerateTokenOptions, TokenVerifierOptions } from './types';
import { splitJWT, ss58DecodePublicKey, generateSS58Address, validateTokenTimes, b64urlEncode } from './utils';

// Set the hash function for @noble/ed25519 using Node.js crypto
ed25519.hashes.sha512 = (...m: Uint8Array[]) => {
  const hasher = createHash('sha512');
  for (const bytes of m) {
    hasher.update(bytes);
  }
  return new Uint8Array(hasher.digest());
};

/**
 * Generate a JWT token with Ed25519 signature
 */
export function generateToken(options: GenerateTokenOptions): string {
  const {
    privateKey,
    subject,
    issuer = 'sensespace',
    expiresIn = 30 * 24 * 60 * 60, // 30 days
    additionalClaims = {}
  } = options;

  // Handle private key input
  let privateKeyBytes: Uint8Array;
  if (typeof privateKey === 'string') {
    try {
      // Try hex decoding first
      privateKeyBytes = new Uint8Array(Buffer.from(privateKey, 'hex'));
    } catch {
      // Try base58 decoding
      try {
        privateKeyBytes = new Uint8Array(Buffer.from(privateKey, 'base64'));
      } catch {
        throw new Error('Private key string must be valid hex or base64');
      }
    }
  } else {
    privateKeyBytes = privateKey;
  }

  // Validate private key length (Ed25519 private keys are 32 bytes)
  if (privateKeyBytes.length !== 32) {
    throw new Error(`Ed25519 private key must be 32 bytes, got ${privateKeyBytes.length}`);
  }

  // Get public key from private key
  const publicKey = ed25519.getPublicKey(privateKeyBytes);

  // Generate SS58 address from public key
  const ss58Address = generateSS58Address(Buffer.from(publicKey));

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + expiresIn,
    nbf: now,
    iss: issuer,
    sub: subject || ss58Address,
    ...additionalClaims
  };

  // Create JWT using jose-compatible format for Ed25519
  const header = { alg: 'EdDSA', typ: 'JWT' };
  const encodedHeader = b64urlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = b64urlEncode(Buffer.from(JSON.stringify(payload)));

  // Create signing input
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signingInputBytes = new TextEncoder().encode(signingInput);

  // Sign with Ed25519
  const signature = ed25519.sign(signingInputBytes, privateKeyBytes);
  const encodedSignature = b64urlEncode(Buffer.from(signature));

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verify JWT token with Ed25519 signature using SS58 address
 */
export async function verifyToken(
  token: string,
  options: TokenVerifierOptions = {}
): Promise<VerifyTokenResult> {
  const {
    didBaseUrl = 'https://api.sensespace.xyz/api/did/',
    allowedIssuers = ['sensespace'],
    maxTokenAge
  } = options;

  try {
    // 1. Parse JWT
    const [header, payload, signatureBytes] = splitJWT(token);

    // 2. Extract subject (SS58 address)
    const sub = payload.sub;
    if (!sub || typeof sub !== 'string') {
      throw new Error('JWT payload has no valid subject');
    }

    // 3. Verify algorithm
    if (header.alg !== 'EdDSA') {
      throw new Error(`Unsupported algorithm: ${header.alg}, expected EdDSA`);
    }

    // 4. Verify issuer if specified
    if (allowedIssuers.length > 0 && payload.iss) {
      if (!allowedIssuers.includes(payload.iss)) {
        throw new Error(`Invalid issuer: ${payload.iss}`);
      }
    }

    // 5. Validate timestamps
    validateTokenTimes(payload, maxTokenAge);

    // 6. SS58 decode to get public key
    const publicKeyBytes = ss58DecodePublicKey(sub);

    // 7. Verify signature
    const [encodedHeader, encodedPayload] = token.split('.').slice(0, 2);
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signingInputBytes = new TextEncoder().encode(signingInput);

    const isValid = await ed25519.verify(
      signatureBytes,
      signingInputBytes,
      publicKeyBytes
    );

    if (!isValid) {
      throw new Error('Invalid JWT signature');
    }

    // 8. Optional: Fetch DID document if didBaseUrl is provided
    let didDocument: Record<string, any> | undefined;
    if (didBaseUrl && sub.startsWith('5')) { // Typical SS58 address format
      try {
        const response = await fetch(`${didBaseUrl}${sub}`);
        if (response.ok) {
          didDocument = await response.json() as Record<string, any>;
        }
      } catch (error) {
        // DID fetching is optional, don't fail verification
        console.warn(`Failed to fetch DID document: ${error}`);
      }
    }

    return {
      success: true,
      claims: payload,
      didDocument
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Token Verifier class for integration with various authentication systems
 */
export class SenseSpaceTokenVerifier {
  private options: TokenVerifierOptions;

  constructor(options: TokenVerifierOptions = {}) {
    this.options = {
      didBaseUrl: 'https://api.sensespace.xyz/api/did/',
      allowedIssuers: ['sensespace'],
      ...options
    };
  }

  /**
   * Verify a bearer token
   */
  async verify(token: string): Promise<VerifyTokenResult> {
    return verifyToken(token, this.options);
  }

  /**
   * Extract claims without verification (for debugging)
   */
  extractClaims(token: string): Record<string, any> | null {
    try {
      const [, payload] = splitJWT(token);
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Update verifier options
   */
  updateOptions(newOptions: Partial<TokenVerifierOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}
