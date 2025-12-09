---
title: agla-error-core
description: Standardized error handling core module for @aglabo ecosystem
---

English | [日本語](README.ja.md)

## @aglabo/agla-error-core

Standardized error handling core module for @aglabo ecosystem.

`@aglabo/agla-error-core` is a library that provides structured error handling.
It enables unified error processing with error codes, severity levels, and context information.

## Features

- **Structured Error Handling** - Consistent error representation with `AglaError` class
- **Severity Levels** - Four levels: `FATAL`, `ERROR`, `WARNING`, `INFO`
- **Error Chaining** - Error chain using ES2022 `Error.cause`
- **Cross-runtime Support** - Compatible with Node.js, Deno, and Bun
- **TypeScript First** - Full type safety
- **Zero Dependencies** - No external dependencies

## Installation

```bash
# pnpm
pnpm add @aglabo/agla-error-core

# npm
npm install @aglabo/agla-error-core

# yarn
yarn add @aglabo/agla-error-core

# bun
bun add @aglabo/agla-error-core

# deno
import { AglaError } from "jsr:@aglabo/agla-error-core";
```

## Quick Start

### Basic Usage

Since AglaError is an abstract class, you need to define your own error class:

```typescript
import { AG_ERROR_SEVERITY, AglaError } from '@aglabo/agla-error-core';

// Define custom error class
class ValidationError extends AglaError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('ValidationError', message, {
      code: 'VALIDATION_FAILED',
      severity: AG_ERROR_SEVERITY.ERROR,
      context,
    });
  }
}

// Use the error
try {
  throw new ValidationError('Invalid email format', {
    field: 'email',
    value: 'invalid-email',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.toString());
    // => ValidationError: Invalid email format {"field":"email","value":"invalid-email"}

    console.log(error.toJSON());
    // => {
    //   errorType: 'ValidationError',
    //   message: 'Invalid email format',
    //   code: 'VALIDATION_FAILED',
    //   severity: 'error',
    //   context: { field: 'email', value: 'invalid-email' }
    // }
  }
}
```

### Using Error Severity

```typescript
import { AG_ERROR_SEVERITY, AG_isValidErrorSeverity } from '@aglabo/agla-error-core';

class DatabaseError extends AglaError {
  constructor(message: string, severity = AG_ERROR_SEVERITY.ERROR) {
    super('DatabaseError', message, {
      code: 'DB_ERROR',
      severity,
      timestamp: new Date(),
    });
  }
}

// Fatal error
const fatalError = new DatabaseError(
  'Connection pool exhausted',
  AG_ERROR_SEVERITY.FATAL,
);

// Warning level error
const warningError = new DatabaseError(
  'Query slow response',
  AG_ERROR_SEVERITY.WARNING,
);

// Validate severity
if (AG_isValidErrorSeverity('error')) {
  // valid
}
```

### Error Chaining

```typescript
class NetworkError extends AglaError {
  constructor(message: string) {
    super('NetworkError', message, {
      code: 'NETWORK_ERROR',
      severity: AG_ERROR_SEVERITY.ERROR,
    });
  }
}

try {
  // Low-level error
  throw new Error('Connection timeout');
} catch (lowLevelError) {
  // Chain to high-level error
  const networkError = new NetworkError('Failed to fetch data');
  const chainedError = networkError.chain(lowLevelError as Error);

  console.log(chainedError.cause); // => Error: Connection timeout
}
```

## API Reference

### `AglaError`

Abstract base class for unified error handling.

#### Constructor

```typescript
constructor(
  errorType: string,
  message: string,
  options?: AglaErrorOptions | AglaErrorContext
)
```

#### Properties

| Property  | Type                             | Description                   |
| --------- | -------------------------------- | ----------------------------- |
| errorType | `string`                         | Error type identifier         |
| message   | `string`                         | Error message                 |
| code      | `string \| undefined`            | Error code                    |
| severity  | `AGT_ErrorSeverity \| undefined` | Severity level                |
| timestamp | `Date \| undefined`              | Error creation timestamp      |
| context   | `AglaErrorContext \| undefined`  | Error context information     |
| cause     | `Error \| undefined`             | Error cause (ES2022 standard) |

#### Methods

| Method              | Description                                |
| ------------------- | ------------------------------------------ |
| toString()          | Returns error as string format             |
| toJSON()            | Returns error as JSON format               |
| chain(cause: Error) | Creates error chain (returns new instance) |

### `AG_ERROR_SEVERITY`

Error severity level definitions.

```typescript
const AG_ERROR_SEVERITY = {
  FATAL: 'fatal', // Critical failures requiring immediate attention
  ERROR: 'error', // Runtime errors preventing normal operation
  WARNING: 'warning', // Potential issues that should be investigated
  INFO: 'info', // Informational messages for debugging
} as const;
```

### `AG_isValidErrorSeverity(value: unknown): boolean`

Type guard function to validate if a value is a valid severity level.

## Requirements

- Node.js: >= 20.0.0
- Deno: Latest version
- Bun: Latest version
- TypeScript: >= 5.9

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Contributing

Bug reports and feature requests are welcome at [Issues](https://github.com/aglabo/agla-error-core/issues).

Pull requests are also welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Links

- [GitHub Repository](https://github.com/aglabo/agla-error-core)
- [npm Package](https://www.npmjs.com/package/@aglabo/agla-error-core)
- [Issue Tracker](https://github.com/aglabo/agla-error-core/issues)

---

Copyright (c) 2025 [atsushifx](https://github.com/atsushifx). Released under the MIT License.
