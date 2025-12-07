// src: src/__tests__/unit/AglaError.chaining.spec.ts
// @(#): AglaError chain method unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

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
