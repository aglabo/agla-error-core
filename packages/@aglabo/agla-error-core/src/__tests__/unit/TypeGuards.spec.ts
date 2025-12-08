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
import { guardAglaErrorContext, isValidAglaErrorContext } from '#shared/types/AglaError.types';

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
    // Test: Non-object rejection
    it('returns false for non-object values', () => {
      const cases = [null, undefined, 'str', 0, true, Symbol('x'), () => {}, BigInt(1)];
      cases.forEach((v) => expect(isValidAglaErrorContext(v)).toBe(false));
    });

    // Test: Plain object acceptance
    it('returns true for plain objects', () => {
      expect(isValidAglaErrorContext({})).toBe(true);
      expect(isValidAglaErrorContext({ user: 'a', id: 1 })).toBe(true);
    });

    // Test: Objects with null/undefined values
    it('returns true for objects with null/undefined values', () => {
      expect(isValidAglaErrorContext({ userId: null })).toBe(true);
      expect(isValidAglaErrorContext({ value: undefined })).toBe(true);
      expect(isValidAglaErrorContext({ a: null, b: undefined, c: 'value' })).toBe(true);
    });

    // Test: Objects with Date/Map/Set/RegExp values
    it('returns true for objects with Date/Map/Set/RegExp values', () => {
      expect(isValidAglaErrorContext({ timestamp: new Date() })).toBe(true);
      expect(isValidAglaErrorContext({ data: new Map() })).toBe(true);
      expect(isValidAglaErrorContext({ items: new Set() })).toBe(true);
      expect(isValidAglaErrorContext({ pattern: /test/ })).toBe(true);
    });

    // Test: Empty object
    it('returns true for empty objects', () => {
      expect(isValidAglaErrorContext({})).toBe(true);
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
