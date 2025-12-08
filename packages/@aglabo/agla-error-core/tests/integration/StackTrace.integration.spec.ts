// src: tests/integration/StackTrace.integration.spec.ts
// @(#): Stack trace handling integration tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { AG_ERROR_SEVERITY } from '#/index';
import { TestAglaError } from '#tests/_helpers/TestAglaError.class';

/**
 * Stack trace handling integration tests
 * Validates stack trace generation, preservation, and separation from string representation
 */
describe('Stack Trace Handling', () => {
  /**
   * Basic stack trace generation
   */
  describe('Basic stack generation', () => {
    it('should preserve stack and include error name', () => {
      const err = new TestAglaError('STACK_TEST', 'stack message');
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain(err.name);
    });

    it('should contain file location information', () => {
      const err = new TestAglaError('LOCATION_TEST', 'with location');
      expect(err.stack).toBeDefined();
      // Stack should contain 'at' which indicates stack frames
      expect(err.stack).toMatch(/\s+at\s+/);
    });
  });

  /**
   * Stack trace separation from toString()
   */
  describe('toString() separation', () => {
    it('should have stack separate from toString()', () => {
      const err = new TestAglaError('NO_STACK_IN_STRING', 'message');
      const str = err.toString();
      // toString() should NOT include stack trace
      expect(str).not.toContain('at ');
      expect(str).toContain('NO_STACK_IN_STRING');
      // but stack property should exist
      expect(err.stack).toBeDefined();
    });

    it('toString() should be concise without stack frames', () => {
      const err = new TestAglaError('CONCISE', 'msg', { code: 'C1' });
      const str = err.toString();
      // Should contain essential info only
      expect(str).toContain('CONCISE');
      expect(str).toContain('msg');
      // Should NOT contain stack frames
      expect(str.split('\n')).toHaveLength(1);
    });
  });

  /**
   * Stack behavior in error chaining
   */
  describe('chain() and stack traces', () => {
    it('should generate new stack when chain() creates new instance', () => {
      const cause = new Error('root cause');
      const original = new TestAglaError('CHAIN_TEST', 'chained error');
      const chained = original.chain(cause);

      // Both should have stack
      expect(original.stack).toBeDefined();
      expect(chained.stack).toBeDefined();

      // Stack traces will be different (new instance = new stack)
      expect(chained.stack).not.toBe(original.stack);

      // Cause relationship preserved
      expect((chained as Error & { cause: Error }).cause).toBe(cause);
    });

    it('chained error stack should point to chain() call site', () => {
      const cause = new Error('original');
      const err = new TestAglaError('CHAIN_SITE', 'msg');
      const chained = err.chain(cause);

      expect(chained.stack).toBeDefined();
      // New stack should contain error name
      expect(chained.stack).toContain(chained.name);
    });
  });

  /**
   * Stack trace in different error configurations
   */
  describe('Stack with various configurations', () => {
    it('should have stack even with minimal configuration', () => {
      const err = new TestAglaError('MINIMAL', 'msg');
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain(err.name);
    });

    it('should have stack with full configuration', () => {
      const err = new TestAglaError('FULL', 'msg', {
        code: 'E001',
        severity: AG_ERROR_SEVERITY.ERROR,
        timestamp: new Date(),
        context: { key: 'value' },
      });
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain(err.name);
    });

    it('should have stack even with context only', () => {
      const err = new TestAglaError('CONTEXT_ONLY', 'msg', { context: { user: 'test' } });
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain(err.name);
    });
  });
});
