// src: src/__tests__/unit/TypeGuards.spec.ts
// @(#): Runtime type guard functions unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { guardAglaErrorContext, isValidAglaErrorContext } from '@shared/types/AglaError.types';

// Test cases
/**
 * Type Guards Unit Tests
 *
 * Tests runtime type guard functions for AglaErrorContext validation
 * and guarding, ensuring proper type safety at runtime.
 */
describe('Type Guards', () => {
  /**
   * isValidAglaErrorContext Validation Tests
   *
   * Tests the validation function for AglaErrorContext objects,
   * covering object type checking and edge case handling.
   */
  describe('isValidAglaErrorContext', () => {
    // Test: Non-object rejection - primitive types and null/undefined
    it('returns false for non-object values', () => {
      const cases = [null, undefined, 'str', 0, true, Symbol('x'), () => {}, BigInt(1)];
      cases.forEach((v) => expect(isValidAglaErrorContext(v)).toBe(false));
    });

    // Test: Object validation - accepts valid plain objects
    it('returns true for plain objects', () => {
      expect(isValidAglaErrorContext({})).toBe(true);
      expect(isValidAglaErrorContext({ user: 'a', id: 1 })).toBe(true);
    });
  });

  /**
   * guardAglaErrorContext Guard Function Tests
   *
   * Tests the guard function that validates and returns AglaErrorContext
   * objects, with proper error throwing for invalid inputs.
   */
  describe('guardAglaErrorContext', () => {
    // Test: Pass-through validation - returns same object reference
    it('returns same object when valid', () => {
      const obj = { k: 'v' };
      const guarded = guardAglaErrorContext(obj);
      expect(guarded).toBe(obj);
      expect(guarded.k).toBe('v');
    });

    // Test: Error throwing for invalid input values
    it('throws for invalid values', () => {
      const invalids = [null, undefined, 'x', 1, true];
      invalids.forEach((v) => expect(() => guardAglaErrorContext(v)).toThrow());
    });
  });
});
