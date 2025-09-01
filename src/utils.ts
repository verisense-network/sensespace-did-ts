import * as bs58Import from 'bs58';
import { createHash } from 'crypto';
import blake2b from 'blake2b';

// Handle bs58 default export properly
const bs58 = bs58Import.default || bs58Import;

/**
 * Base64URL decode with padding fix
 */
export function b64urlDecode(data: string): Buffer {
  const pad = 4 - (data.length % 4);
  const padded = pad === 4 ? data : data + '='.repeat(pad);
  return Buffer.from(padded, 'base64url');
}

/**
 * Base64URL encode
 */
export function b64urlEncode(data: Buffer | Uint8Array): string {
  return Buffer.from(data).toString('base64url');
}

/**
 * Split JWT token into parts
 * Returns [header, payload, signature_bytes]. Does not perform signature verification.
 */
export function splitJWT(token: string): [Record<string, any>, Record<string, any>, Buffer] {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [h, p, s] = parts;

  const header = JSON.parse(b64urlDecode(h).toString());
  const payload = JSON.parse(b64urlDecode(p).toString());
  const signature = b64urlDecode(s);

  return [header, payload, signature];
}

/**
 * Decode SS58 address to extract 32-byte Ed25519 public key
 * Convention:
 * - Only handles 32-byte AccountId format
 * - 1~2 byte prefix (depending on address type), 2-byte checksum at the end
 */
export function ss58DecodePublicKey(ss58Addr: string): Buffer {
  const raw = Buffer.from(bs58.decode(ss58Addr));

  if (raw.length < 1 + 32 + 2) {
    throw new Error(`SS58 raw too short: ${raw.length} bytes`);
  }

  let prefixLen: number;

  // Try 1-byte prefix
  if (raw.length === 1 + 32 + 2) {
    prefixLen = 1;
  }
  // Try 2-byte prefix (some networks/types use 2 bytes)  
  else if (raw.length === 2 + 32 + 2) {
    prefixLen = 2;
  }
  // For 5DA9... type common addresses, usually 1+32+2=35 bytes
  else {
    prefixLen = raw.length - 32 - 2; // Try to be compatible
  }

  const pubkey = raw.slice(prefixLen, prefixLen + 32);

  if (pubkey.length !== 32) {
    throw new Error('Decoded public key is not 32 bytes');
  }

  return Buffer.from(pubkey);
}

/**
 * Generate SS58 address from Ed25519 public key
 */
export function generateSS58Address(publicKey: Buffer, prefix: number = 42): string {
  const checksumInput = Buffer.concat([Buffer.from([prefix]), publicKey]);

  // Use blake2b with default size and take first 2 bytes for SS58 checksum
  const hash = blake2b(64); // 64 bytes output (default)
  hash.update(checksumInput);
  const fullHash = hash.digest();
  const checksum = fullHash.slice(0, 2);

  const addressBytes = Buffer.concat([
    Buffer.from([prefix]),
    publicKey,
    checksum
  ]);

  return bs58.encode(addressBytes);
}

/**
 * Validate token timestamp claims
 */
export function validateTokenTimes(payload: Record<string, any>, maxAge?: number): void {
  const now = Math.floor(Date.now() / 1000);

  // Check expiration
  if (payload.exp && typeof payload.exp === 'number') {
    if (now >= payload.exp) {
      throw new Error('Token expired');
    }
  }

  // Check not before
  if (payload.nbf && typeof payload.nbf === 'number') {
    if (now < payload.nbf) {
      throw new Error('Token not yet valid');
    }
  }

  // Check issued at + max age
  if (maxAge && payload.iat && typeof payload.iat === 'number') {
    if (now > payload.iat + maxAge) {
      throw new Error('Token too old');
    }
  }
}
