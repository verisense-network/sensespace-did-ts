# SenseSpace DID TypeScript - Examples

This directory contains various examples demonstrating how to use the SenseSpace DID TypeScript library.

## Files

### `basic-usage.mjs`
Complete example showing token generation and verification with all features including DID document fetching.

**Usage:**
```bash
node examples/basic-usage.mjs
```

### `debug-test.mjs`
Debug test for troubleshooting token generation and verification, showing JWT payload details.

**Usage:**
```bash
node examples/debug-test.mjs
```

### `minimal-test.mjs`
Test for SS58 address generation and decoding to verify the core cryptographic functions work correctly.

**Usage:**
```bash
node examples/minimal-test.mjs
```

### `step-by-step.mjs`
Detailed step-by-step JWT verification process for debugging and understanding the internal workings.

**Usage:**
```bash
node examples/step-by-step.mjs
```

## Running Examples

Make sure to build the project first:

```bash
npm run build
```

Then run any example:

```bash
node examples/basic-usage.mjs
```

## Notes

- All examples use ES modules (`.mjs` files)
- Examples demonstrate both successful and error cases
- The basic usage example includes comprehensive error handling
- Examples show integration with both individual functions and the class-based API
