// src: src/__tests__/unit/AglaError.core.spec.ts
// @(#) : AglaError コア（コンストラクタ・基本プロパティ）単体テスト
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaErrorOptions } from '#shared/types/AglaError.types';
import { AG_ERROR_SEVERITY } from '#shared/types/ErrorSeverity.types';

// Test utilities
import type { _TAglaErrorContextWithSymbols } from '#tests/_helpers/test-types.types';
import { TestAglaError } from '#tests/_helpers/TestAglaError.class';

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
    // Test: All options setting together
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

  /**
   * Message Edge Case Tests
   *
   * Tests error creation with edge case message values including
   * empty strings, very long messages, and special characters.
   */
  describe('When creating error with message edge cases', () => {
    // Test: Empty message
    it('Then should handle empty message', () => {
      const error = new TestAglaError('EMPTY_MSG', '');
      expect(error.message).toBe('[TEST] ');
    });

    // Test: Very long message
    it('Then should handle very long message', () => {
      const longMsg = 'x'.repeat(10000);
      const error = new TestAglaError('LONG_MSG', longMsg);
      expect(error.message.length).toBe(10000 + 7); // "[TEST] " prefix
      expect(error.message).toContain('[TEST]');
    });

    // Test: Message with special characters
    it('Then should handle message with special characters', () => {
      const specialMsg = '\x00\n\t\u0001';
      const error = new TestAglaError('SPECIAL', specialMsg);
      expect(error.message).toContain('[TEST]');
      expect(error.message).toContain('\n');
    });

    // Test: Message with emoji
    it('Then should handle message with emoji', () => {
      const emojiMsg = '🔥エラー\n詳細';
      const error = new TestAglaError('EMOJI', emojiMsg);
      expect(error.message).toContain('🔥');
      expect(error.message).toContain('[TEST]');
    });
  });

  /**
   * Timestamp Boundary Value Tests
   *
   * Tests error creation with timestamp boundary values including
   * minimum, maximum, pre-epoch, and future dates.
   */
  describe('When creating error with timestamp boundaries', () => {
    // Test: Minimum timestamp (epoch)
    it('Then should handle minimum timestamp', () => {
      const minTimestamp = new Date(0);
      const error = new TestAglaError('MIN_TIME', 'msg', { timestamp: minTimestamp });
      expect(error.timestamp).toBe(minTimestamp);
      expect(error.timestamp!.getTime()).toBe(0);
    });

    // Test: Maximum timestamp
    it('Then should handle maximum timestamp', () => {
      const maxTs = new Date(8.64e15);
      const error = new TestAglaError('MAX_TS', 'msg', { timestamp: maxTs });
      expect(error.timestamp).toBe(maxTs);
    });

    // Test: Pre-epoch timestamp
    it('Then should handle pre-epoch timestamp', () => {
      const preEpoch = new Date(-86400000); // 1969-12-31
      const error = new TestAglaError('PREEPOCH', 'msg', { timestamp: preEpoch });
      expect(error.timestamp).toBe(preEpoch);
      expect(error.timestamp!.getTime()).toBeLessThan(0);
    });

    // Test: Far future timestamp
    it('Then should handle far future timestamp', () => {
      const future = new Date(2100, 0, 1);
      const error = new TestAglaError('FUTURE_TS', 'msg', { timestamp: future });
      expect(error.timestamp).toBe(future);
      expect(error.timestamp!.getFullYear()).toBe(2100);
    });
  });

  /**
   * Context Edge Case Tests
   *
   * Tests error creation with edge case context values including
   * empty objects, null values, undefined values, and Date objects.
   */
  describe('When creating error with context edge cases', () => {
    // Test: Empty context
    it('Then should handle empty context', () => {
      const error = new TestAglaError('EMPTY_CTX', 'msg', { context: {} });
      expect(error.context).toEqual({});
    });

    // Test: Context with null values
    it('Then should handle context with null values', () => {
      const context = { userId: null, operation: 'test' };
      const error = new TestAglaError('NULL_CTX', 'msg', { context });
      expect(error.context?.userId).toBe(null);
      expect(error.context?.operation).toBe('test');
    });

    // Test: Context with undefined values
    it('Then should handle context with undefined values', () => {
      const context = { value: undefined };
      const error = new TestAglaError('UNDEF_CTX', 'msg', { context });
      expect(error.context).toHaveProperty('value');
      expect(error.context?.value).toBeUndefined();
    });

    // Test: Context with Date objects
    it('Then should handle context with Date objects', () => {
      const date = new Date('2025-12-31');
      const context = { timestamp: date };
      const error = new TestAglaError('DATE_CTX', 'msg', { context });
      expect(error.context?.timestamp).toBe(date);
      expect(error.context?.timestamp).toBeInstanceOf(Date);
    });
  });

  /**
   * Context Circular Reference Tests
   *
   * Tests that circular references within context are allowed
   * (policy: allow but may cause JSON.stringify errors).
   */
  describe('When creating context with circular references', () => {
    // Test: Simple self-reference in context
    it('Then should allow simple self-referencing context', () => {
      type SelfRefContext = { name: string; self?: SelfRefContext };
      const context: SelfRefContext = { name: 'circular' };
      context.self = context;

      const error = new TestAglaError('SELF_REF_CTX', 'msg', { context });

      // Context is stored without error
      expect(error.context).toBe(context);
      expect((error.context as SelfRefContext).name).toBe('circular');
      expect((error.context as SelfRefContext).self).toBe(context);
    });

    // Test: Complex circular reference in context (A -> B -> A)
    it('Then should allow complex circular reference in context', () => {
      type CircularContext = { id: string; ref?: CircularContext };
      const contextA: CircularContext = { id: 'A' };
      const contextB: CircularContext = { id: 'B', ref: contextA };
      contextA.ref = contextB;

      const error = new TestAglaError('COMPLEX_CIRCULAR_CTX', 'msg', { context: contextA });

      // Context is stored without error
      expect(error.context).toBe(contextA);
      expect((error.context as CircularContext).id).toBe('A');
      expect((error.context as CircularContext).ref?.id).toBe('B');
      expect((error.context as CircularContext).ref?.ref).toBe(contextA);
    });

    // Test: Nested circular reference in context
    it('Then should allow deeply nested circular reference', () => {
      type NestedContext = { level: number; parent?: NestedContext; children?: NestedContext[] };
      const root: NestedContext = { level: 0, children: [] };
      const child1: NestedContext = { level: 1, parent: root, children: [] };
      const child2: NestedContext = { level: 1, parent: root, children: [] };

      root.children = [child1, child2];
      child1.children = [root]; // Create cycle

      const error = new TestAglaError('NESTED_CIRCULAR_CTX', 'msg', { context: root });

      // Context is stored without error
      expect(error.context).toBe(root);
      expect((error.context as NestedContext).level).toBe(0);
      expect((error.context as NestedContext).children?.length).toBe(2);
      expect((error.context as NestedContext).children?.[0].children?.[0]).toBe(root);
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

    // Verify context is properly stored
    expect(error.context).toBe(largeContext);
    expect(error.context?.data).toHaveLength(1000);
    expect((error.context.metadata as { version: string }).version).toBe('1.0.0');
    expect(error.name).toBe('TestAglaError');
  });
});
