// src: src/__tests__/runtime/deno/agla-error-basic.spec.ts
// @(#) : Runtime tests for basic AglaError functionality in Deno
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assertEquals, assertExists, assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';

// Import from built module (after build, use the ESM output)
// For Deno, we import from the module directory which is built by tsup
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types.ts';
import { TestAglaError } from '@tests/_helpers/TestAglaError.class.ts';

Deno.test('Deno Runtime: AglaError instantiation', () => {
  const error = new TestAglaError('TestError', 'Test error message');
  assert(error instanceof Error);
  assert(error.message.includes('Test error message'));
});

Deno.test('Deno Runtime: AglaError with severity option', () => {
  const error = new TestAglaError('TestError', 'Test error message', {
    severity: AG_ERROR_SEVERITY.ERROR,
  });
  assertEquals(error.severity, AG_ERROR_SEVERITY.ERROR);
});

Deno.test('Deno Runtime: AglaError with code option', () => {
  const error = new TestAglaError('ValidationError', 'Invalid input', {
    code: 'VALIDATION_001',
  });
  assertEquals(error.code, 'VALIDATION_001');
});

Deno.test('Deno Runtime: AglaError with timestamp', () => {
  const ts = new Date('2025-08-29T21:42:00Z');
  const error = new TestAglaError('TestError', 'Test error', {
    timestamp: ts,
  });
  assertEquals(error.timestamp, ts);
});

Deno.test('Deno Runtime: Error.cause support', () => {
  const aglaError = new TestAglaError('WrappedError', 'Wrapped error message', {
    cause: 'Original error',
  });
  assert(aglaError instanceof Error);
});

Deno.test('Deno Runtime: Error chaining with throw/catch', () => {
  let caught = false;
  let message = '';
  try {
    try {
      throw new Error('Original error');
    } catch (err) {
      throw new TestAglaError('ProcessError', 'Failed to process', {
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  } catch (err) {
    caught = true;
    message = (err as TestAglaError).message;
  }
  assert(caught);
  assert(message.includes('Failed to process'));
});

Deno.test('Deno Runtime: ErrorSeverity enum values', () => {
  assertExists(AG_ERROR_SEVERITY.FATAL);
  assertExists(AG_ERROR_SEVERITY.ERROR);
  assertExists(AG_ERROR_SEVERITY.WARNING);
  assertExists(AG_ERROR_SEVERITY.INFO);
});

Deno.test('Deno Runtime: Multiple severity levels', () => {
  const severities = [
    AG_ERROR_SEVERITY.FATAL,
    AG_ERROR_SEVERITY.ERROR,
    AG_ERROR_SEVERITY.WARNING,
    AG_ERROR_SEVERITY.INFO,
  ];

  severities.forEach((severity) => {
    const error = new TestAglaError('SeverityTest', 'Test', { severity });
    assertEquals(error.severity, severity);
  });
});

Deno.test('Deno Runtime: throw and catch AglaError', () => {
  let caught = false;
  try {
    throw new TestAglaError('TestError', 'Test error');
  } catch (err) {
    caught = true;
    assert(err instanceof TestAglaError);
  }
  assert(caught);
});

Deno.test('Deno Runtime: Error message preservation', () => {
  const message = 'Important error message';
  let result = '';
  try {
    throw new TestAglaError('TestError', message);
  } catch (err) {
    result = (err as TestAglaError).message;
  }
  assert(result.includes(message));
});

Deno.test('Deno Runtime: try/catch/finally flow', () => {
  let finallyCalled = false;
  try {
    throw new TestAglaError('TestError', 'Test error');
  } catch (err) {
    assert(err instanceof TestAglaError);
  } finally {
    finallyCalled = true;
  }
  assert(finallyCalled);
});

Deno.test('Deno Runtime: JSON serialization', () => {
  const error = new TestAglaError('TestError', 'Test error message', {
    code: 'TEST_001',
    severity: AG_ERROR_SEVERITY.ERROR,
  });
  const json = error.toJSON?.();
  assertExists(json);
});

Deno.test('Deno Runtime: Error serialization properties', () => {
  const error = new TestAglaError('CustomError', 'Custom error message', {
    code: 'CUSTOM_001',
    severity: AG_ERROR_SEVERITY.ERROR,
  });
  const serialized = JSON.stringify(error);
  assert(serialized.includes('CustomError'));
});

Deno.test('Deno Runtime: globalThis.Error compatibility', () => {
  const error = new TestAglaError('TestError', 'Test');
  assert(error instanceof globalThis.Error);
});

Deno.test('Deno Runtime: Stack trace generation', () => {
  const error = new TestAglaError('TestError', 'Test');
  assertExists(error.stack);
});
