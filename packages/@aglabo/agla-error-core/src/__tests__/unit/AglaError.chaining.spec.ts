// src: src/__tests__/unit/AglaError.chaining.spec.ts
// @(#): AglaError chain method unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY } from '#shared/types/ErrorSeverity.types';

// Test utilities
import { BasicAglaError, TestAglaError } from '#tests/_helpers/TestAglaError.class';

// Test cases
/**
 * AglaError Chain Method Unit Tests
 *
 * Tests error chaining functionality including message combination,
 * property preservation, context merging, and edge case handling.
 */
describe('Given AglaError method chaining', () => {
  /**
   * Normal Error Chaining Tests
   *
   * Tests standard error chaining with valid Error objects,
   * focusing on message combination and context preservation.
   */
  describe('When chaining with cause error', () => {
    // Test: Message preservation and cause chain with ES2022 standard
    it('Then should preserve message and set cause using ES2022 standard', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);

      expect(chainedError.message).toBe('[TEST] Original message');
      expect(chainedError.errorType).toBe('TEST_ERROR');
      expect((chainedError as Error).cause).toBe(causeError);
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });

    // Test: Context preservation with ES2022 cause chain
    it('Then should preserve context and use standard Error.cause', () => {
      const originalContext = { userId: '123', operation: 'test' };
      const originalError = new TestAglaError('TEST_ERROR', 'Original message', { context: originalContext });
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);

      expect(chainedError.context).toHaveProperty('userId', '123');
      expect(chainedError.context).toHaveProperty('operation', 'test');
      expect((chainedError as Error).cause).toBe(causeError);
      expect((chainedError as Error).cause).toEqual(causeError);
    });

    // Test: Immutability - returns new instance with ES2022 cause
    it('Then 正常系：should return new error instance with preserved type', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);
      expect(chainedError).not.toBe(originalError);
      expect(chainedError).toBeInstanceOf(TestAglaError);
      expect(chainedError.errorType).toBe(originalError.errorType);
      expect(chainedError.message).toBe(originalError.message);
    });
  });

  /**
   * Edge Case Error Chaining Tests
   *
   * Tests error chaining with invalid or non-Error cause parameters,
   * including null, undefined, string, and object causes.
   */
  describe('When chaining with invalid or non-Error causes', () => {
    // Test: Null cause handling - ES2022 allows null as cause
    it('Then 正常系：should handle null cause using ES2022 standard', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const nullCause = null as unknown as Error;
      const chainedError = originalError.chain(nullCause);
      expect(chainedError.message).toBe('[TEST] Original message');
      expect((chainedError as Error).cause).toBe(null);
    });

    // Test: Undefined cause handling - ES2022 allows undefined as cause
    it('Then 正常系：should handle undefined cause using ES2022 standard', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const undefinedCause = undefined as unknown as Error;
      const chainedError = originalError.chain(undefinedCause);
      expect(chainedError.message).toBe('[TEST] Original message');
      expect((chainedError as Error).cause).toBe(undefined);
    });

    // Test: String cause handling - ES2022 accepts any value as cause
    it('Then 正常系：should handle string cause using ES2022 standard', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const stringCause = 'string error' as unknown as Error;
      const stringChainedError = originalError.chain(stringCause);
      expect(stringChainedError.message).toBe('[TEST] Original message');
      expect((stringChainedError as Error).cause).toBe(stringCause);
    });

    // Test: Object cause handling - ES2022 accepts any value as cause
    it('Then エッジケース：should handle object cause using ES2022 standard', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const objectCause = { message: 'object error message' } as unknown as Error;
      const chainedError = originalError.chain(objectCause);
      expect(chainedError.message).toBe('[TEST] Original message');
      expect((chainedError as Error).cause).toBe(objectCause);
    });
  });
});

/**
 * BasicAglaError Chain Tests (Non-Inheritance Pattern)
 *
 * Tests error chaining with BasicAglaError that does not override
 * the message getter, ensuring ES2022 Error.cause standard compatibility.
 */
describe('Given BasicAglaError (non-inheritance pattern)', () => {
  /**
   * BasicAglaError Chain Tests
   *
   * Tests chaining functionality using BasicAglaError that preserves
   * the original message without custom formatting.
   */
  describe('When chaining with ES2022 Error.cause', () => {
    // Test: Basic chain with original message preservation
    it('Then should chain errors preserving original message', () => {
      const originalError = new BasicAglaError('BASIC_ERROR', 'Original message');
      const causeError = new Error('Root cause');

      const chainedError = originalError.chain(causeError);

      expect(chainedError.message).toBe('Original message');
      expect((chainedError as Error).cause).toBe(causeError);
      expect(chainedError.errorType).toBe('BASIC_ERROR');
      expect(chainedError).toBeInstanceOf(BasicAglaError);
    });

    // Test: Multiple chaining levels
    it('Then should handle multiple chaining levels', () => {
      const originalError = new BasicAglaError('MULTI_BASIC', 'Base message');

      const level1 = originalError.chain(new Error('Level 1'));
      const level2 = level1.chain(new Error('Level 2'));

      expect(level2.message).toBe('Base message');
      expect(((level2 as Error).cause as Error).message).toBe('Level 2');
      expect(level2).not.toBe(originalError);
      expect(level2).not.toBe(level1);
    });

    // Test: Context preservation
    it('Then should preserve context', () => {
      const originalContext = { userId: '123', operation: 'basic-test' };
      const originalError = new BasicAglaError('CONTEXT_BASIC', 'msg', {
        context: originalContext,
        severity: AG_ERROR_SEVERITY.WARNING,
      });
      const causeError = new Error('Context cause');

      const chainedError = originalError.chain(causeError);

      expect(chainedError.context).toBe(originalContext);
      expect(chainedError.severity).toBe(AG_ERROR_SEVERITY.WARNING);
    });
  });

  /**
   * Deep Chaining Tests
   *
   * Tests error chaining with many levels to verify
   * performance and memory handling.
   */
  describe('When chaining with deep nesting', () => {
    // Test: 10-level chaining
    it('Then should handle 10-level chaining', () => {
      let currentError: TestAglaError = new TestAglaError('DEEP_CHAIN', 'Base message');

      for (let i = 1; i <= 10; i++) {
        currentError = currentError.chain(new Error(`Level ${i}`));
      }

      expect(currentError.message).toBe('[TEST] Base message');
      expect((currentError as Error).cause).toBeInstanceOf(Error);
      expect(((currentError as Error).cause as Error).message).toBe('Level 10');
    });

    // Test: 100-level chaining
    it('Then should handle 100-level chaining', () => {
      let currentError: TestAglaError = new TestAglaError('DEEP_100', 'Base');

      for (let i = 1; i <= 100; i++) {
        currentError = currentError.chain(new Error(`Level ${i}`));
      }

      expect(currentError.message).toBe('[TEST] Base');
      expect((currentError as Error).cause).toBeInstanceOf(Error);
      expect(((currentError as Error).cause as Error).message).toBe('Level 100');
    });

    // Test: 1000-level chaining (stress test)
    it('Then should handle 1000-level chaining without stack overflow', () => {
      let currentError: TestAglaError = new TestAglaError('DEEP_1000', 'Base');

      for (let i = 1; i <= 1000; i++) {
        currentError = currentError.chain(new Error(`Level ${i}`));
      }

      expect(currentError.message).toBe('[TEST] Base');
      expect((currentError as Error).cause).toBeInstanceOf(Error);
      expect(((currentError as Error).cause as Error).message).toBe('Level 1000');
    });
  });

  /**
   * Circular Reference Chain Tests
   *
   * Tests that circular references in error chains are allowed
   * without throwing errors (policy: allow circular references).
   */
  describe('When creating circular reference chains', () => {
    // Test: Simple circular reference (error1 -> error2 -> error1)
    it('Then should allow simple circular reference chain', () => {
      const error1 = new TestAglaError('CIRCULAR_1', 'Error 1');
      const error2 = new TestAglaError('CIRCULAR_2', 'Error 2');

      // Create circular reference: error1 -> error2 -> error1
      const chainedError1 = error1.chain(error2 as unknown as Error);
      const chainedError2 = error2.chain(error1 as unknown as Error);

      // Verify chain is created without throwing
      expect(chainedError1.message).toBe('[TEST] Error 1');
      expect((chainedError1 as Error).cause).toBe(error2);
      expect(chainedError2.message).toBe('[TEST] Error 2');
      expect((chainedError2 as Error).cause).toBe(error1);
    });

    // Test: Self-referencing chain (error -> error)
    it('Then should allow self-referencing chain', () => {
      const error = new TestAglaError('SELF_REF', 'Self reference');

      // Create self-reference: error -> error
      const chainedError = error.chain(error as unknown as Error);

      expect(chainedError.message).toBe('[TEST] Self reference');
      expect((chainedError as Error).cause).toBe(error);
      expect(chainedError).not.toBe(error); // chain creates new instance
    });

    // Test: Complex circular reference (A -> B -> C -> A)
    it('Then should allow complex circular reference chain', () => {
      const errorA = new TestAglaError('CIRCULAR_A', 'Error A');
      const errorB = new TestAglaError('CIRCULAR_B', 'Error B');
      const errorC = new TestAglaError('CIRCULAR_C', 'Error C');

      // Create circular reference: A -> B -> C -> A
      const chainedA = errorA.chain(errorB as unknown as Error);
      const chainedB = errorB.chain(errorC as unknown as Error);
      const chainedC = errorC.chain(errorA as unknown as Error);

      // Verify chain structure
      expect((chainedA as Error).cause).toBe(errorB);
      expect((chainedB as Error).cause).toBe(errorC);
      expect((chainedC as Error).cause).toBe(errorA);

      // Verify messages are preserved
      expect(chainedA.message).toBe('[TEST] Error A');
      expect(chainedB.message).toBe('[TEST] Error B');
      expect(chainedC.message).toBe('[TEST] Error C');
    });
  });
});
