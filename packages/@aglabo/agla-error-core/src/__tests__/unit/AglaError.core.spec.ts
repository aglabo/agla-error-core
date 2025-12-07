// src: src/__tests__/unit/AglaError.core.spec.ts
// @(#) : AglaError コア（コンストラクタ・基本プロパティ）単体テスト
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaErrorOptions } from '@shared/types/AglaError.types';
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import type { _TAglaErrorContextWithSymbols } from '@tests/_helpers/test-types.types';
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test cases
/**
 * AglaError Core Constructor Tests
 *
 * Tests the core functionality of AglaError constructor, including
 * basic property setting, option handling, and edge case scenarios.
 */
describe('Given AglaError constructor with valid inputs', () => {
  /**
   * Basic Parameter Construction Tests
   *
   * Tests error creation with fundamental parameters and option
   * handling including severity, timestamp, and context setting.
   */
  describe('When creating error with basic parameters only', () => {
    // Test: Severity option setting
    it('Then 正常系：should set severity option', () => {
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { severity: AG_ERROR_SEVERITY.ERROR });
      expect(error.severity).toBe(AG_ERROR_SEVERITY.ERROR);
    });

    // Test: Timestamp option setting
    it('Then 正常系：should set timestamp option', () => {
      const ts = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { timestamp: ts });
      expect(error.timestamp).toBe(ts);
    });

    // Test: Multiple options setting together
    it('Then 正常系：should set all options together', () => {
      const code = 'TEST_001';
      const severity = AG_ERROR_SEVERITY.FATAL;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const context = { userId: '123', operation: 'all-options' };
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { code, severity, timestamp, context });
      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
      expect(error.context).toBe(context);
    });

    // Test: Legacy context parameter format support
    it('Then 正常系：should support legacy context parameter format', () => {
      const context = { userId: '123', operation: 'legacy' };
      const error = new TestAglaError('TEST_ERROR', 'Test error message', context as AglaErrorOptions);
      expect(error.context).toBe(context);
    });
  });

  /**
   * Edge Case Parameter Handling Tests
   *
   * Tests error creation with invalid or edge case parameters,
   * including invalid timestamps, severities, and complex contexts.
   */
  describe('When creating error with invalid or edge case parameters', () => {
    // Test: Invalid timestamp handling
    it('Then should handle invalid timestamp gracefully', () => {
      const invalidDate = new Date('invalid-date');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp: invalidDate });
      expect(error.timestamp).toBe(invalidDate);
      expect(isNaN(error.timestamp!.getTime())).toBe(true);
    });

    // Test: Invalid severity handling
    it('Then should handle invalid severity as per implementer policy', () => {
      const invalidSeverity = 'critical' as unknown as typeof AG_ERROR_SEVERITY.ERROR;
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: invalidSeverity });
      expect(error.severity).toBe(invalidSeverity);
    });

    // Test: Complex context object handling
    it('Then should handle complex context objects', () => {
      // function values in context
      const callback = (): string => 'test';
      const functionContext = { callback, operation: 'function-test' };
      const functionError = new TestAglaError('TEST_ERROR', 'Test message', { context: functionContext });
      expect(typeof functionError.context?.callback).toBe('function');

      // symbol keys in context
      const symbolKey = Symbol('testSymbol');
      const symbolContext = { [symbolKey]: 'symbol-value', operation: 'symbol-test' } as _TAglaErrorContextWithSymbols;
      const symbolError = new TestAglaError('TEST_ERROR', 'Test message', { context: symbolContext });
      expect((symbolError.context as _TAglaErrorContextWithSymbols)[symbolKey]).toBe('symbol-value');

      // nested object context
      const nestedContext = {
        user: { id: '123', name: 'John' },
        operation: { type: 'CREATE', resource: 'user' },
        metadata: { timestamp: '2025-08-29', version: '1.0' },
      };
      const nestedError = new TestAglaError('TEST_ERROR', 'Test message', { context: nestedContext });
      expect(nestedError.context).toBe(nestedContext);

      // array values in context
      const arrayContext = {
        operations: ['create', 'update', 'delete'],
        errors: [{ code: 'E001' }, { code: 'E002' }],
      };
      const arrayError = new TestAglaError('TEST_ERROR', 'Test message', { context: arrayContext });
      expect(arrayError.context).toBe(arrayContext);
    });

    // Test: Symbol context type compatibility
    it('Then should handle type compatibility for symbol context', () => {
      const symbolKey = Symbol.for('test');
      const symbolContext: _TAglaErrorContextWithSymbols = {
        [symbolKey]: 'symbol-value',
        operation: 'symbol-test',
        normalProp: 'normal',
      };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context: symbolContext });
      expect((error.context as _TAglaErrorContextWithSymbols)[symbolKey]).toBe('symbol-value');
    });

    // Test: Minimum timestamp handling
    it('Then should handle minimum timestamp', () => {
      const minTimestamp = new Date(0);
      const minError = new TestAglaError('MIN_TIME_ERROR', 'Min timestamp', { timestamp: minTimestamp });
      expect(minError.timestamp).toBe(minTimestamp);
    });
  });
});

/**
 * AglaError Property Defaults Tests
 *
 * Tests verification of property default values and option
 * value preservation in AglaError instances.
 */
describe('Given AglaError property defaults verification', () => {
  /**
   * Property Default Value Tests
   *
   * Tests that provided option values are properly preserved
   * and not overridden by default values.
   */
  describe('When checking property defaults', () => {
    // Test: Option value preservation
    it('Then エッジケース：should keep provided option values', () => {
      const code = 'TEST_001';
      const severity = AG_ERROR_SEVERITY.ERROR;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code, severity, timestamp });

      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
    });
  });
});

/**
 * AglaError Minimal Parameter Compatibility Tests
 *
 * Tests backward compatibility with legacy parameter formats
 * and minimal constructor parameter scenarios.
 */
describe('Given AglaError constructor minimal parameter compatibility', () => {
  /**
   * Legacy Context Parameter Format Tests
   *
   * Tests backward compatibility when using legacy context
   * parameter format without explicit options object.
   */
  describe('When using legacy context parameter format', () => {
    // Test: Backward compatibility maintenance
    it('Then should maintain backward compatibility', () => {
      const context = { userId: '123', operation: 'legacy' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', context as AglaErrorOptions);
      expect(error.context).toBe(context);
      expect(error.code).toBeUndefined();
      expect(error.severity).toBeUndefined();
      expect(error.timestamp).toBeUndefined();
    });
  });
});

/**
 * AglaError Large Context Tests
 *
 * Tests AglaError handling of large or heavy context objects
 * to ensure performance and stability.
 */
describe('Given AglaError with large or heavy contexts', () => {
  // Test: Large context object handling
  it('Then should handle large object context', () => {
    const largeContext = {
      data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
      metadata: { timestamp: Date.now(), version: '1.0.0' },
    };
    const error = new TestAglaError('LARGE_CONTEXT_ERROR', 'Large context test', { context: largeContext });
    expect(error.name).toBe('TestAglaError');
  });
});
