// src: src/__tests__/functional/TypeSystemIntegration.functional.spec.ts
// @(#): TypeScript type system integration functional tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '@shared/types/AglaError.types';
import type { AglaErrorContext, AglaErrorOptions } from '@shared/types/AglaError.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

/**
 * Processed error type for testing type system integration scenarios.
 * Represents an error that has been processed through various transformations
 * including serialization and chaining operations.
 *
 * @example
 * ```typescript
 * const processed: ProcessedError = {
 *   type: 'VALIDATION_ERROR',
 *   severity: ErrorSeverity.HIGH,
 *   serialized: { message: 'Invalid input', code: 'E001' },
 *   chained: new TestAglaError('NETWORK_ERROR', 'Connection failed')
 * };
 * ```
 */
type ProcessedError = {
  /** The error type identifier */
  type: string;
  /** Optional severity level of the error */
  severity?: unknown;
  /** Serialized representation of the error data */
  serialized: unknown;
  /** The chained AglaError instance */
  chained: AglaError;
};

// Test cases
/**
 * TypeScript Type System Integration Tests
 *
 * Tests type safety, union types, context type compatibility,
 * and generic handler preservation across AglaError operations.
 */
describe('TypeScript Integration', () => {
  /**
   * Generic Handler Type Preservation Tests
   *
   * Tests that generic error handlers maintain type safety
   * and preserve types across different implementations.
   */
  describe('Generic handlers preserve types', () => {
    // Test: Type safety maintenance in generic processing functions
    it('maintains type safety across implementations', () => {
      /**
       * Generic error processor function for type preservation testing.
       * This mock function demonstrates type safety maintenance across AglaError operations,
       * processing errors while preserving type information and method availability.
       *
       * @param error - AglaError instance to process
       * @returns ProcessedError object containing type, serialization, and chained error
       */
      const errorProcessor = (error: AglaError): ProcessedError => ({
        type: error.errorType,
        serialized: error.toJSON(),
        chained: error.chain(new Error('Test cause')),
      });

      const errors: AglaError[] = [new TestAglaError('TEST_ERROR', 'Test message')];
      const processed = errors.map(errorProcessor);

      processed.forEach((result) => {
        expect(typeof result.type).toBe('string');
        expect(result.serialized).toHaveProperty('errorType');
      });
    });
  });

  /**
   * Union Type Compatibility Tests
   *
   * Tests compatibility with standard Error class in union types
   * and mixed error array handling.
   */
  describe('Union with Error works', () => {
    // Test: Mixed AglaError and Error array support
    it('supports (AglaError | Error)[] pattern', () => {
      const mixed: (AglaError | Error)[] = [
        new TestAglaError('TEST_TYPE', 'Test message'),
        new Error('Standard error'),
      ];

      mixed.forEach((err) => {
        if (err instanceof AglaError) {
          expect(typeof err.errorType).toBe('string');
          expect(typeof err.toJSON).toBe('function');
        }
      });
    });
  });

  /**
   * AglaErrorContext Type Integrity Tests
   *
   * Tests AglaErrorContext type compatibility, options integration,
   * and context getter type safety.
   */
  describe('AglaErrorContext replacement integrity', () => {
    // Test: AglaErrorOptions context type compatibility
    it('AglaErrorOptions.context satisfies AglaErrorContext', () => {
      const validContext: AglaErrorContext = {
        userId: 'user123',
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' },
      };

      const options: AglaErrorOptions = {
        code: 'TEST_CODE',
        context: validContext,
      };

      const contextCheck: AglaErrorContext | undefined = options.context;
      expect(contextCheck).toBeDefined();
      expect(typeof options.context?.userId).toBe('string');
      expect(options.context?.metadata).toEqual({ source: 'test' });
    });

    // Test: Context getter type safety with proper typing
    it('AglaError.context getter returns AglaErrorContext | undefined', () => {
      const contextWithData: AglaErrorContext = {
        traceId: 'trace-345',
        spanId: 'span-678',
        environment: 'test',
        features: { logging: true, monitoring: false },
      };

      const errorWithContext = new TestAglaError('CONTEXT_TEST', 'Context test message', { context: contextWithData });
      const errorWithoutContext = new TestAglaError('NO_CONTEXT_TEST', 'No context message');

      const c1: AglaErrorContext | undefined = errorWithContext.context;
      const c2: AglaErrorContext | undefined = errorWithoutContext.context;
      expect(c1).toBeDefined();
      expect(c2).toBeUndefined();
      if (errorWithContext.context) {
        expect(typeof errorWithContext.context.traceId).toBe('string');
        expect(errorWithContext.context.features).toEqual({ logging: true, monitoring: false });
      }
    });
  });
});
