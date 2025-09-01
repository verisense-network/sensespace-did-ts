// Types and interfaces
export interface VerifyTokenResult {
  success: boolean;
  error?: string;
  claims?: Record<string, any>;
  didDocument?: Record<string, any>;
}

export interface GenerateTokenOptions {
  privateKey: string | Uint8Array;
  subject?: string;
  issuer?: string;
  expiresIn?: number; // seconds
  additionalClaims?: Record<string, any>;
}

export interface TokenVerifierOptions {
  didBaseUrl?: string;
  allowedIssuers?: string[];
  maxTokenAge?: number; // seconds
}
