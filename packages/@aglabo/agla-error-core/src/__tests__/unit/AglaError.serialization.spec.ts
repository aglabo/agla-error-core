// src: src/__tests__/unit/AglaError.serialization.spec.ts
// @(#): AglaError serialization (toJSON/toString) unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '@shared/types/AglaError.types';
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

/**
 * Circular context type for testing circular reference handling in serialization.
 * Used to test how AglaError handles self-referencing objects in context data.
 *
 * @example
 * ```typescript
 * const circular: _TCircularContext = { name: 'test' };
 * circular.self = circular; // Creates circular reference
 * ```
 */
type _TCircularContext = { name: string; self?: _TCircularContext };

// Test cases
/**
 * AglaError Serialization Unit Tests
 *
 * Tests toJSON and toString methods for various property combinations,
 * edge cases, and circular reference handling.
 */
describe('Given AglaError instance for JSON serialization', () => {
  /**
   * Basic Serialization Tests
   *
   * Tests fundamental serialization functionality with minimal
   * and complete property sets.
   */
  describe('When calling toJSON with basic properties only', () => {
    // Test: Basic errorType and message serialization
    it('Then should include errorType and message', () => {
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const error = new TestAglaError(errorType, message);
      const json = error.toJSON();
      expect(json).toEqual({ errorType, message: `[TEST] ${message}` });
    });

    // Test: Context inclusion in serialization
    it('Then 正常系：should include context when present', () => {
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      const json = error.toJSON();
      expect(json).toEqual({ errorType: 'TEST_ERROR', message: '[TEST] Test message', context });
    });

    // Test: Timestamp formatting to ISO string
    it('Then 正常系：should include all properties with correct formatting', () => {
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp });
      const json = error.toJSON();
      expect(json.timestamp).toBe(timestamp.toISOString());
    });
  });

  // Test: Circular reference handling with JSON.stringify error
  it('Then should handle circular reference edge case', () => {
    const circularContext: _TCircularContext = { name: 'circular' };
    circularContext.self = circularContext;
    const error = new TestAglaError('CIRCULAR_ERROR', 'Circular test', { context: circularContext });
    expect(() => JSON.stringify(error.toJSON())).toThrow();
  });
});

/**
 * AglaError String Representation Tests
 *
 * Tests toString method with various property combinations
 * and format consistency validation.
 */
describe('Given AglaError string representation', () => {
  /**
   * Basic toString Method Tests
   *
   * Tests string conversion functionality and format consistency
   * with different property combinations.
   */
  describe('When converting to string', () => {
    // Test: String format consistency with context
    it('Then should follow consistent format with context', () => {
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const context = { userId: '123' };
      const error = new TestAglaError(errorType, message, { context });
      const expectedFormat = `${errorType}: [TEST] ${message} ${JSON.stringify(context)}`;
      const result = error.toString();
      expect(result).toBe(expectedFormat);
    });
  });

  /**
   * Complex Property Combination Tests
   *
   * Tests handling of special property combinations including
   * all severity levels and complete property sets.
   */
  describe('When handling special property combinations', () => {
    // Test: All severity levels with context handling
    it('Then エッジケース：should handle all severity levels with context', () => {
      const severities = [
        AG_ERROR_SEVERITY.FATAL,
        AG_ERROR_SEVERITY.ERROR,
        AG_ERROR_SEVERITY.WARNING,
        AG_ERROR_SEVERITY.INFO,
      ];
      const context = { test: 'context' };
      severities.forEach((severity) => {
        const error = new TestAglaError('TEST_ERROR', 'Test message', { severity, context });
        expect(error.severity).toBe(severity);
        expect(error.context).toBe(context);
      });
    });

    // Test: Complete property set handling
    it('Then エッジケース：should handle complete property set', () => {
      const timestamp = new Date('2025-12-31T23:59:59.999Z');
      const severity = AG_ERROR_SEVERITY.FATAL;
      const context = { final: true, year: 2025 };
      const error = new TestAglaError('FINAL_ERROR', 'Final test', { timestamp, severity, context, code: 'FINAL_001' });
      expect(error.timestamp).toBe(timestamp);
      expect(error.severity).toBe(severity);
      expect(error.context).toBe(context);
      expect(error.code).toBe('FINAL_001');
    });
  });
});

/**
 * AglaError Interface Compatibility Tests
 *
 * Tests type system integration, implementation consistency,
 * and interface method availability across different scenarios.
 */
describe('Given AglaError instance for string representation', () => {
  /**
   * Interface Method Verification Tests
   *
   * Tests method availability, type compatibility, and interface
   * consistency across different AglaError implementations.
   */
  describe('When calling toString with basic properties', () => {
    // Test: Error processing functions with AglaError instances
    it('Then should include errorType in output', () => {
      type ProcessedError = { type: string; serialized: unknown; chained: AglaError };
      /**
       * Error processing function for interface compatibility testing.
       * This mock function demonstrates AglaError's interface consistency and method availability,
       * verifying that all required methods work correctly across different implementations.
       *
       * @param error - AglaError instance to process for interface verification
       * @returns ProcessedError containing extracted type, serialized data, and chained error
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

    // Test: Union type support with mixed error arrays
    it('Then 正常系：should support union types with Error class', () => {
      const mixedErrors: (AglaError | Error)[] = [
        new TestAglaError('TEST_TYPE', 'Test message'),
        new Error('Standard error'),
      ];

      mixedErrors.forEach((error) => {
        if (error instanceof AglaError) {
          expect(typeof error.errorType).toBe('string');
          expect(typeof error.toJSON).toBe('function');
        }
      });
    });

    // Test: Interface method consistency verification
    it('Then 正常系：should provide consistent interface methods', () => {
      const implementations = [new TestAglaError('TEST', 'msg')];
      implementations.forEach((impl) => {
        expect(typeof impl.toJSON).toBe('function');
        expect(typeof impl.toString).toBe('function');
        expect(typeof impl.chain).toBe('function');
        expect(typeof (impl as AglaError).errorType).toBe('string');
      });
    });

    // Test: Base property consistency across implementations
    it('Then 正常系：should maintain property consistency across implementations', () => {
      const baseProps = ['errorType', 'message', 'name', 'stack'] as const;
      const implementations = [new TestAglaError('TEST_ERROR', 'Test message')];
      implementations.forEach((impl) => {
        baseProps.forEach((prop) => {
          expect(prop in impl).toBe(true);
        });
      });
    });
  });
});
