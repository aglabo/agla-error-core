// src: src/__tests__/unit/AglaError.inheritance.spec.ts
// @(#) : AglaError inheritance and message override tests (ES2022 standard)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test cases
/**
 * AglaError Inheritance and Message Override Tests (ES2022 Standard)
 *
 * Tests inheritance behavior and message getter override
 * while maintaining ES2022 Error.cause standard compatibility.
 */
describe('Given AglaError inheritance and method overriding', () => {
  /**
   * Message Getter Override Tests
   *
   * Tests that subclasses can safely override the message getter
   * while maintaining ES2022 standard cause chain behavior.
   */
  describe('When TestAglaError overrides message getter', () => {
    // Test: Custom message formatting via getter override
    it('Then should apply custom message formatting with ES2022 cause', () => {
      const originalError = new TestAglaError('INHERITANCE_TEST', 'Original message');
      const causeError = new Error('Root cause');

      const chainedError = originalError.chain(causeError);

      // カスタムフォーマットが適用される（message getter）
      expect(chainedError.message).toBe('[TEST] Original message');

      // ES2022 standard cause is set
      expect((chainedError as Error).cause).toBe(causeError);

      // 型安全性の確認：戻り値はTestAglaError型
      expect(chainedError).not.toBe(originalError); // 新しいインスタンス
      expect(chainedError).toBeInstanceOf(TestAglaError);

      // 基本プロパティが保持されているか
      expect(chainedError.errorType).toBe('INHERITANCE_TEST');
    });

    // Test: Context preservation with message getter override
    it('Then should preserve context with ES2022 cause chain', () => {
      const originalContext = { userId: '123', operation: 'inheritance-test' };
      const originalError = new TestAglaError('CONTEXT_TEST', 'Context test', {
        context: originalContext,
        severity: AG_ERROR_SEVERITY.ERROR,
      });
      const causeError = new Error('Context cause');

      const chainedError = originalError.chain(causeError);

      // カスタムメッセージフォーマット
      expect(chainedError.message).toBe('[TEST] Context test');

      // ES2022 cause is set
      expect((chainedError as Error).cause).toBe(causeError);

      // コンテキストが保持される
      expect(chainedError.context).toHaveProperty('userId', '123');
      expect(chainedError.context).toHaveProperty('operation', 'inheritance-test');

      // その他のプロパティも保持
      expect(chainedError.severity).toBe(AG_ERROR_SEVERITY.ERROR);
    });

    // Test: Multiple chaining with message getter override
    it('Then should handle multiple chaining with custom formatting', () => {
      const originalError = new TestAglaError('MULTI_CHAIN', 'Base message');

      const level1 = originalError.chain(new Error('Level 1'));
      const level2 = level1.chain(new Error('Level 2'));

      // 各レベルでカスタムフォーマットが適用される
      expect(level1.message).toBe('[TEST] Base message');
      expect(level2.message).toBe('[TEST] Base message');

      // ES2022 cause chain
      expect((level1 as Error).cause).toBeInstanceOf(Error);
      expect(((level1 as Error).cause as Error).message).toBe('Level 1');
      expect((level2 as Error).cause).toBeInstanceOf(Error);
      expect(((level2 as Error).cause as Error).message).toBe('Level 2');

      // 型安全性が維持される
      expect(level2).not.toBe(originalError); // 新しいインスタンス
      expect(level2).toBeInstanceOf(TestAglaError);
      expect(level2.errorType).toBe('MULTI_CHAIN');
    });

    // Test: JSON serialization with message getter override
    it('Then should serialize correctly with custom formatting', () => {
      const error = new TestAglaError('SERIALIZATION_TEST', 'Serialization message', {
        code: 'SER_001',
        severity: AG_ERROR_SEVERITY.WARNING,
      });

      const chainedError = error.chain(new Error('Serialization cause'));
      const json = chainedError.toJSON();

      // ES2022 standard: message is preserved, no "(caused by: ...)" appended
      // Note: cause information is stored in Error.cause, not in context
      expect(json).toEqual({
        errorType: 'SERIALIZATION_TEST',
        message: '[TEST] Serialization message',
        code: 'SER_001',
        severity: AG_ERROR_SEVERITY.WARNING,
      });
    });

    // Test: toString method with message getter override
    it('Then should format string correctly with custom message', () => {
      const error = new TestAglaError('STRING_TEST', 'String message', {
        context: { operation: 'toString-test' },
      });

      const chainedError = error.chain(new Error('String cause'));
      const stringOutput = chainedError.toString();

      expect(stringOutput).toContain('STRING_TEST');
      expect(stringOutput).toContain('[TEST] String message');
      expect(stringOutput).toContain('toString-test');
    });
  });

  /**
   * Type Safety Verification Tests
   *
   * Tests that TypeScript type system correctly handles subclass
   * message getter overrides and maintains compile-time type safety.
   */
  describe('When verifying TypeScript type safety', () => {
    // Test: Method chaining maintains correct types
    it('Then should maintain type information through method chaining', () => {
      const error = new TestAglaError('TYPE_SAFETY', 'Type test');

      // メソッドチェーンでも型が保持される
      const chained = error.chain(new Error('Type cause'));

      // TypeScriptコンパイラレベルでの型安全性確認
      const typedError: TestAglaError = chained;
      expect(typedError).not.toBe(error); // 新しいインスタンス
      expect(typedError).toBeInstanceOf(TestAglaError);

      // TestAglaError特有のメソッドへのアクセス確認
      expect(typeof chained.chain).toBe('function');
      expect(typeof chained.toJSON).toBe('function');
      expect(typeof chained.toString).toBe('function');

      // ES2022 cause is accessible
      expect((chained as Error).cause).toBeInstanceOf(Error);
    });
  });
});
