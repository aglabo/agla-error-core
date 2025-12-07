// src: src/__tests__/unit/AglaError.chain-patterns.spec.ts
// @(#) : AglaError chain usage patterns tests (ES2022 Error.cause standard)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';
import { BasicAglaError, TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test cases
/**
 * AglaError Chain Usage Patterns Tests (ES2022 Standard)
 *
 * Tests different usage patterns for the chain method using ES2022 Error.cause:
 * - Non-inheritance pattern (recommended): Using basic AglaError without method overrides
 * - Inheritance pattern (advanced): Using subclass with custom message formatting
 *
 * This ensures both usage patterns work correctly with ES2022 standard Error.cause chain.
 */
describe('Given different AglaError usage patterns', () => {
  /**
   * Non-Inheritance Pattern Tests
   *
   * Tests using AglaError directly without method overrides.
   * This is the recommended approach for most use cases.
   */
  describe('When using non-inheritance pattern (recommended)', () => {
    // Test: Basic chain functionality with ES2022 standard
    it('Then should chain errors using ES2022 Error.cause', () => {
      const originalError = new BasicAglaError('BASIC_ERROR', 'Original message');
      const causeError = new Error('Root cause');

      const chainedError = originalError.chain(causeError);

      // ES2022 standard: message is preserved, cause is set
      expect(chainedError.message).toBe('Original message');
      expect((chainedError as Error).cause).toBe(causeError);

      // 基本プロパティの確認
      expect(chainedError.errorType).toBe('BASIC_ERROR');
      expect(chainedError).not.toBe(originalError); // 新しいインスタンス
      expect(chainedError).toBeInstanceOf(BasicAglaError);
    });

    // Test: Multiple chaining with ES2022 standard
    it('Then should handle multiple chaining with ES2022 cause chain', () => {
      const originalError = new BasicAglaError('MULTI_BASIC', 'Base message');

      const level1 = originalError.chain(new Error('Level 1'));
      const level2 = level1.chain(new Error('Level 2'));

      // ES2022 standard: each level preserves message and sets cause
      expect(level1.message).toBe('Base message');
      expect((level1 as Error).cause).toBeInstanceOf(Error);
      expect(((level1 as Error).cause as Error).message).toBe('Level 1');

      expect(level2.message).toBe('Base message');
      expect((level2 as Error).cause).toBeInstanceOf(Error);
      expect(((level2 as Error).cause as Error).message).toBe('Level 2');

      // 各レベルで新しいインスタンスが作成される
      expect(level2).not.toBe(originalError);
      expect(level2).not.toBe(level1);
      expect(level2).toBeInstanceOf(BasicAglaError);
    });

    // Test: Context preservation with ES2022 standard
    it('Then should preserve context with ES2022 cause chain', () => {
      const originalContext = { userId: '123', operation: 'basic-test' };
      const originalError = new BasicAglaError('CONTEXT_BASIC', 'Context message', {
        context: originalContext,
        severity: AG_ERROR_SEVERITY.WARNING,
      });
      const causeError = new Error('Context cause');

      const chainedError = originalError.chain(causeError);

      // Context is preserved
      expect(chainedError.context).toHaveProperty('userId', '123');
      expect(chainedError.context).toHaveProperty('operation', 'basic-test');

      // Cause is set using ES2022 standard
      expect((chainedError as Error).cause).toBe(causeError);

      // その他のプロパティも保持
      expect(chainedError.severity).toBe(AG_ERROR_SEVERITY.WARNING);
    });
  });

  /**
   * Inheritance Pattern Tests
   *
   * Tests using AglaError with message getter override for custom formatting.
   * This pattern should be used only when custom behavior is specifically needed.
   */
  describe('When using inheritance pattern (advanced)', () => {
    // Test: Custom message formatting through inheritance
    it('Then should apply custom message formatting via getter override', () => {
      const originalError = new TestAglaError('CUSTOM_ERROR', 'Custom message');
      const causeError = new Error('Custom cause');

      const chainedError = originalError.chain(causeError);

      // カスタムフォーマット（[TEST]プレフィックス）が適用される
      expect(chainedError.message).toBe('[TEST] Custom message');

      // ES2022 standard cause is set
      expect((chainedError as Error).cause).toBe(causeError);

      // 基本プロパティの確認
      expect(chainedError.errorType).toBe('CUSTOM_ERROR');
      expect(chainedError).not.toBe(originalError); // 新しいインスタンス
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });

    // Test: Multiple chaining with custom formatting
    it('Then should handle multiple chaining with custom formatting', () => {
      const originalError = new TestAglaError('MULTI_CUSTOM', 'Base message');

      const level1 = originalError.chain(new Error('Level 1'));
      const level2 = level1.chain(new Error('Level 2'));

      // 各レベルでのカスタムフォーマット（[TEST]プレフィックス）
      expect(level1.message).toBe('[TEST] Base message');
      expect(level2.message).toBe('[TEST] Base message');

      // ES2022 cause chain
      expect((level1 as Error).cause).toBeInstanceOf(Error);
      expect((level2 as Error).cause).toBeInstanceOf(Error);

      // 新しいインスタンスであることを確認
      expect(level2).not.toBe(originalError);
      expect(level2).toBeInstanceOf(TestAglaError);
    });
  });

  /**
   * Pattern Comparison Tests
   *
   * Tests comparing the behavior between inheritance and non-inheritance patterns
   * to ensure both approaches work as expected with ES2022 standard.
   */
  describe('When comparing usage patterns', () => {
    // Test: Both patterns preserve core functionality
    it('Then both patterns should preserve core AglaError functionality', () => {
      const basicError = new BasicAglaError('BASIC', 'Basic message');
      const customError = new TestAglaError('CUSTOM', 'Custom message');

      const basicChained = basicError.chain(new Error('Basic cause'));
      const customChained = customError.chain(new Error('Custom cause'));

      // 両方とも基本機能を保持
      expect(basicChained.errorType).toBe('BASIC');
      expect(customChained.errorType).toBe('CUSTOM');

      expect(typeof basicChained.toJSON).toBe('function');
      expect(typeof customChained.toJSON).toBe('function');

      expect(typeof basicChained.toString).toBe('function');
      expect(typeof customChained.toString).toBe('function');

      // Both use ES2022 cause
      expect((basicChained as Error).cause).toBeInstanceOf(Error);
      expect((customChained as Error).cause).toBeInstanceOf(Error);
    });

    // Test: Serialization works for both patterns
    it('Then both patterns should serialize correctly', () => {
      const basicError = new BasicAglaError('SERIAL_BASIC', 'Basic serial', {
        code: 'B001',
        severity: AG_ERROR_SEVERITY.INFO,
      });
      const customError = new TestAglaError('SERIAL_CUSTOM', 'Custom serial', {
        code: 'C001',
        severity: AG_ERROR_SEVERITY.ERROR,
      });

      const basicChained = basicError.chain(new Error('Basic cause'));
      const customChained = customError.chain(new Error('Custom cause'));

      const basicJson = basicChained.toJSON();
      const customJson = customChained.toJSON();

      // 両方とも正しくシリアライズされる（ES2022 message preservation）
      expect(basicJson.errorType).toBe('SERIAL_BASIC');
      expect(basicJson.code).toBe('B001');
      expect(basicJson.message).toBe('Basic serial');

      expect(customJson.errorType).toBe('SERIAL_CUSTOM');
      expect(customJson.code).toBe('C001');
      expect(customJson.message).toBe('[TEST] Custom serial');
    });
  });
});
