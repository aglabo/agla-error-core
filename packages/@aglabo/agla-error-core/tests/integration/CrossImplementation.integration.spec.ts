// src: tests/integration/CrossImplementation.integration.spec.ts
// @(#): Cross-implementation compatibility integration tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '@shared/types/AglaError.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

/**
 * Cross-implementation compatibility integration tests
 * Tests compatibility between different AglaError implementations and consumer expectations
 */
describe('Cross Implementation Compatibility', () => {
  /**
   * Consumer interface compatibility scenarios
   */
  describe('Consumer expects AglaError-like shape', () => {
    /**
     * Mock consumer function that expects AglaError-like interface
     * @param e - Object with errorType and toJSON method
     * @returns True if JSON contains valid errorType string
     */
    const consumer = (e: { errorType: string; toJSON: () => unknown }): boolean => {
      const json = e.toJSON() as { errorType?: unknown };
      return typeof json.errorType === 'string';
    };

    // Interface compatibility: consumer functions accept TestAglaError instances
    it('accepts TestAglaError and preserves fields', () => {
      const err = new TestAglaError('X_IMPL', 'cross impl');
      expect(consumer(err)).toBe(true);
      const json = err.toJSON();
      expect(json).toHaveProperty('errorType', 'X_IMPL');
      expect(json).toHaveProperty('message', '[TEST] cross impl');
    });

    it('rejects non-conforming shape (missing errorType in toJSON)', () => {
      const fake = {
        errorType: 'FAKE',
        toJSON: () => ({ message: 'no errorType' }),
      };
      expect(consumer(fake)).toBe(false);
    });
  });

  /**
   * Native Errorとの組み合わせ使用時の互換性テスト
   */
  describe('Union with native Error does not break usage', () => {
    it('filters AglaError instances correctly', () => {
      const list: (AglaError | Error)[] = [new TestAglaError('A', 'a'), new Error('b')];
      const aglaOnly = list.filter((e): e is AglaError => e instanceof AglaError);
      expect(aglaOnly).toHaveLength(1);
      expect(aglaOnly[0].errorType).toBe('A');
    });
  });
});
