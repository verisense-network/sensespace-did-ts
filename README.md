# SenseSpace DID Token Verification (TypeScript)

[![npm version](https://img.shields.io/npm/v/@verisense-network/sensespace-did-ts.svg)](https://www.npmjs.com/package/@verisense-network/sensespace-did-ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive TypeScript library for verifying JWT tokens with Ed25519 signatures using SS58 addresses in the SenseSpace ecosystem. This library provides both standalone token verification and integration capabilities for building secure, decentralized applications.

## Features

🔐 **Ed25519 JWT Verification**: Verify JWT tokens with EdDSA algorithm  
🌐 **SS58 Address Support**: Native support for Substrate-style SS58 addresses  
📄 **DID Document Resolution**: Optional DID document fetching and validation  
⚡ **Modern TypeScript**: Full TypeScript support with comprehensive type definitions  
🔧 **Flexible Configuration**: Customizable DID service endpoints  
🛡️ **Security Focused**: Comprehensive error handling and validation  
📦 **Easy Installation**: Simple npm installation with minimal dependencies  
🚀 **ESM & CJS**: Supports both ES modules and CommonJS  

## Installation

```bash
npm install @verisense-network/sensespace-did-ts
```

## Quick Start

### Basic Token Verification

```typescript
import { verifyToken } from '@verisense-network/sensespace-did-ts';

// Your JWT token
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...";

// Verify the token
const result = await verifyToken(token);

if (result.success) {
  console.log("✅ Token verified successfully!");
  console.log(`Subject: ${result.claims?.sub}`);
  console.log(`Claims:`, result.claims);
} else {
  console.log(`❌ Verification failed: ${result.error}`);
}
```

### With DID Document Fetching

```typescript
import { verifyToken } from '@verisense-network/sensespace-did-ts';

// Verify token and fetch DID document
const result = await verifyToken(token, {
  didBaseUrl: "https://api.sensespace.xyz/api/did/",  // Optional, this is the default
  allowedIssuers: ["sensespace"],
  maxTokenAge: 24 * 60 * 60  // 24 hours in seconds
});

if (result.success) {
  console.log(`✅ Token verified:`, result.claims);
  
  if (result.didDocument) {
    console.log(`📄 DID Document:`, result.didDocument);
  }
}
```

### Token Generation

```typescript
import { generateToken } from '@verisense-network/sensespace-did-ts';
import { randomBytes } from 'crypto';

// Generate a random Ed25519 private key
const privateKey = randomBytes(32);

// Generate a JWT token
const token = generateToken({
  privateKey,
  issuer: 'sensespace',
  expiresIn: 60 * 60 * 24, // 1 day in seconds
  additionalClaims: {
    permissions: ['read', 'write'],
    custom: 'value'
  }
});

console.log(`Generated token: ${token}`);
```

### Using the SenseSpaceTokenVerifier Class

```typescript
import { SenseSpaceTokenVerifier } from '@verisense-network/sensespace-did-ts';

// Create verifier instance
const verifier = new SenseSpaceTokenVerifier({
  didBaseUrl: "https://api.sensespace.xyz/api/did/",
  allowedIssuers: ["sensespace"],
  maxTokenAge: 24 * 60 * 60
});

// Verify token
const result = await verifier.verify(token);

if (result.success) {
  console.log("Token is valid");
  console.log(`Subject: ${result.claims?.sub}`);
} else {
  console.log(`Token verification failed: ${result.error}`);
}

// Extract claims without verification (for debugging)
const claims = verifier.extractClaims(token);
console.log("Claims:", claims);
```

## API Reference

### Core Functions

#### `verifyToken(token, options?)`

Verifies a JWT token with Ed25519 signature using SS58 address.

**Parameters:**
- `token` (string): The JWT token to verify
- `options` (TokenVerifierOptions, optional): Verification options
  - `didBaseUrl` (string): Base URL for DID API. Default: `"https://api.sensespace.xyz/api/did/"`
  - `allowedIssuers` (string[]): Array of allowed token issuers. Default: `["sensespace"]`
  - `maxTokenAge` (number): Maximum token age in seconds

**Returns:** `Promise<VerifyTokenResult>`
- `success` (boolean): Whether verification succeeded
- `claims` (object): JWT claims (if successful)
- `error` (string): Error message (if verification failed)
- `didDocument` (object): DID document (if fetched successfully)

#### `generateToken(options)`

Generates a JWT token for a given private key.

**Parameters:**
- `options` (GenerateTokenOptions):
  - `privateKey` (Uint8Array | string): Ed25519 private key in bytes or hex string
  - `subject` (string, optional): Token subject (defaults to generated SS58 address)
  - `issuer` (string, optional): Token issuer. Default: `"sensespace"`
  - `expiresIn` (number, optional): Token expiration in seconds. Default: `30 * 24 * 60 * 60` (30 days)
  - `additionalClaims` (object, optional): Additional JWT claims

**Returns:** `string` - JWT token string

### SenseSpaceTokenVerifier Class

#### Constructor

```typescript
new SenseSpaceTokenVerifier(options?: TokenVerifierOptions)
```

#### Methods

- `verify(token: string): Promise<VerifyTokenResult>` - Verify a token
- `extractClaims(token: string): Record<string, any> | null` - Extract claims without verification
- `updateOptions(newOptions: Partial<TokenVerifierOptions>): void` - Update verifier options

### Types

```typescript
interface VerifyTokenResult {
  success: boolean;
  error?: string;
  claims?: Record<string, any>;
  didDocument?: Record<string, any>;
}

interface GenerateTokenOptions {
  privateKey: string | Uint8Array;
  subject?: string;
  issuer?: string;
  expiresIn?: number;
  additionalClaims?: Record<string, any>;
}

interface TokenVerifierOptions {
  didBaseUrl?: string;
  allowedIssuers?: string[];
  maxTokenAge?: number;
}
```

## Advanced Usage

### Custom DID Service

```typescript
// Use a custom DID service URL
const result = await verifyToken(token, {
  didBaseUrl: "https://your-custom-did-service.com/api/did/"
});
```

### Error Handling

```typescript
import { verifyToken } from '@verisense-network/sensespace-did-ts';

try {
  const result = await verifyToken(token);
  
  if (result.success && result.claims) {
    console.log("Token is valid");
    console.log(`Subject: ${result.claims.sub}`);
    console.log(`Issued at: ${new Date(result.claims.iat * 1000)}`);
    console.log(`Expires at: ${new Date(result.claims.exp * 1000)}`);
  } else {
    console.log(`Token verification failed: ${result.error}`);
  }
  
} catch (error) {
  console.log(`Unexpected error: ${error}`);
}
```

### Token Generation with Custom Claims

```typescript
import { generateToken } from '@verisense-network/sensespace-did-ts';

const token = generateToken({
  privateKey: privateKeyBytes,
  subject: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // Custom SS58 address
  issuer: "my-custom-issuer",
  expiresIn: 60 * 60, // 1 hour
  additionalClaims: {
    role: "admin",
    permissions: ["read", "write", "delete"],
    metadata: {
      version: "1.0.0",
      env: "production"
    }
  }
});
```

## Requirements

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0 (for development)

### Dependencies

- `@noble/ed25519`: Ed25519 cryptographic operations
- `bs58`: Base58 encoding/decoding
- `jsonwebtoken`: JWT handling utilities
- `node-forge`: Additional cryptographic utilities

## Development

### Installation from Source

```bash
git clone https://github.com/your-username/@verisense-network/sensespace-did-ts.git
cd sensespace-did-ts
npm install
```

### Building

```bash
# Build the library
npm run build

# Watch mode for development
npm run dev

# Clean build directory
npm run clean
```

### Running Examples

```bash
# Run the basic usage example
npm run build
node examples/basic-usage.mjs
```

## Security Considerations

⚠️ **Private Key Handling**: Never expose private keys in client-side code  
🔒 **Token Storage**: Store tokens securely and use HTTPS for transmission  
🆔 **DID Resolution**: Verify DID documents from trusted sources  
⏰ **Token Expiration**: Always check token expiration times  
🔐 **Algorithm Validation**: This library only accepts EdDSA algorithm tokens  
🛡️ **Network Security**: Use secure channels for all communications  

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial TypeScript implementation
- Full Ed25519 JWT verification support
- SS58 address handling
- DID document resolution
- Comprehensive TypeScript types
- ESM and CJS support

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/verisense-network/sensespace-did-ts/issues)
- Documentation: This README and inline code comments

---

Made with ❤️ for the SenseSpace ecosystem
