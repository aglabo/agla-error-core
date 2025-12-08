// src: src/__tests__/runtime/bun/agla-error-basic.spec.ts
// @(#) : Runtime tests for basic AglaError functionality in Bun
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_ERROR_SEVERITY } from '#shared/types/ErrorSeverity.types';
import { TestAglaError } from '#tests/_helpers/TestAglaError.class';
import { describe, expect, it } from 'bun:test';

describe('Bun Runtime: AglaError Basic Functionality', () => {
  describe('AglaError instantiation', () => {
    it('should create AglaError with minimum parameters', () => {
      const error = new TestAglaError('TestError', 'Test error message');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Test error message');
    });

    it('should create AglaError with severity option', () => {
      const error = new TestAglaError('TestError', 'Test error message', {
        severity: AG_ERROR_SEVERITY.ERROR,
      });
      expect(error.severity).toBe(AG_ERROR_SEVERITY.ERROR);
    });

    it('should create AglaError with code option', () => {
      const error = new TestAglaError('ValidationError', 'Invalid input', {
        code: 'VALIDATION_001',
      });
      expect(error.code).toBe('VALIDATION_001');
    });

    it('should create AglaError with timestamp', () => {
      const ts = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TestError', 'Test error', {
        timestamp: ts,
      });
      expect(error.timestamp).toBe(ts);
    });
  });

  describe('Error.cause support', () => {
    it('should support Error.cause for error chaining', () => {
      const aglaError = new TestAglaError('WrappedError', 'Wrapped error message', {
        cause: 'Original error',
      });
      expect(aglaError).toBeInstanceOf(Error);
    });

    it('should chain errors using throw/catch', () => {
      try {
        try {
          throw new Error('Original error');
        } catch (err) {
          throw new TestAglaError('ProcessError', 'Failed to process', {
            cause: err instanceof Error ? err.message : String(err),
          });
        }
      } catch (err) {
        expect(err).toBeInstanceOf(TestAglaError);
        expect((err as TestAglaError).message).toContain('Failed to process');
      }
    });
  });

  describe('ErrorSeverity enum', () => {
    it('should have defined severity levels', () => {
      expect(AG_ERROR_SEVERITY.FATAL).toBeDefined();
      expect(AG_ERROR_SEVERITY.ERROR).toBeDefined();
      expect(AG_ERROR_SEVERITY.WARNING).toBeDefined();
      expect(AG_ERROR_SEVERITY.INFO).toBeDefined();
    });

    it('should allow creating errors with different severity levels', () => {
      const severities = [
        AG_ERROR_SEVERITY.FATAL,
        AG_ERROR_SEVERITY.ERROR,
        AG_ERROR_SEVERITY.WARNING,
        AG_ERROR_SEVERITY.INFO,
      ];

      severities.forEach((severity) => {
        const error = new TestAglaError('SeverityTest', 'Test', { severity });
        expect(error.severity).toBe(severity);
      });
    });
  });

  describe('Error handling flow', () => {
    it('should throw and catch AglaError', () => {
      expect(() => {
        throw new TestAglaError('TestError', 'Test error');
      }).toThrow();
    });

    it('should preserve error message through throw/catch cycle', () => {
      const message = 'Important error message';
      try {
        throw new TestAglaError('TestError', message);
      } catch (err) {
        expect((err as TestAglaError).message).toContain(message);
      }
    });

    it('should work with try/catch/finally', () => {
      let finallyCalled = false;
      try {
        throw new TestAglaError('TestError', 'Test error');
      } catch (err) {
        expect(err).toBeInstanceOf(TestAglaError);
      } finally {
        finallyCalled = true;
      }
      expect(finallyCalled).toBe(true);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize AglaError to JSON', () => {
      const error = new TestAglaError('TestError', 'Test error message', {
        code: 'TEST_001',
        severity: AG_ERROR_SEVERITY.ERROR,
      });
      const json = error.toJSON?.();
      expect(json).toBeDefined();
    });

    it('should preserve error properties in serialization', () => {
      const error = new TestAglaError('CustomError', 'Custom error message', {
        code: 'CUSTOM_001',
        severity: AG_ERROR_SEVERITY.ERROR,
      });
      const serialized = JSON.stringify(error);
      expect(serialized).toContain('CustomError');
    });
  });

  describe('Runtime compatibility', () => {
    it('should work with globalThis.Error', () => {
      const error = new TestAglaError('TestError', 'Test');
      expect(error instanceof globalThis.Error).toBe(true);
    });

    it('should be usable in Promise rejection', async () => {
      const promise = Promise.reject(
        new TestAglaError('PromiseError', 'Promise rejection test'),
      );
      await expect(promise).rejects.toThrow();
    });
  });

  describe('Stack trace guarantees (Bun)', () => {
    it('✔1: stack should exist as string', () => {
      const error = new TestAglaError('StackTest', 'Test message');
      expect(typeof error.stack === 'string' || error.stack === undefined).toBe(true);
      // In practice, Bun always provides stack
      expect(error.stack).toBeDefined();
    });

    it('✔2: stack should contain error name', () => {
      const error = new TestAglaError('CustomErrorName', 'Test');
      expect(error.stack).toContain(error.name);
    });

    it('✔3: stack should contain error message', () => {
      const error = new TestAglaError('TestError', 'Unique message 12345');
      expect(error.stack).toContain(error.message);
      expect(error.stack).toContain('Unique message 12345');
    });

    it('✔4: chain() should create new stack for new instance', () => {
      const cause = new Error('root cause');
      const original = new TestAglaError('ChainTest', 'original error');
      const originalStack = original.stack;

      const chained = original.chain(cause);
      const chainedStack = chained.stack;

      // Both should have stack
      expect(originalStack).toBeDefined();
      expect(chainedStack).toBeDefined();

      // Stack should be different (new instance = new stack)
      expect(chainedStack).not.toBe(originalStack);

      // New stack should still contain error name and message
      expect(chainedStack).toContain(chained.name);
      expect(chainedStack).toContain('original error');
    });
  });
});
