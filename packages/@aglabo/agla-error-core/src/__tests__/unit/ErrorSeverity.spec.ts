// src: src/__tests__/unit/ErrorSeverity.spec.ts
// @(#) : Unit tests for ErrorSeverity enum and validation functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY, AG_isValidErrorSeverity } from '#shared/types/ErrorSeverity.types';

// Test cases
/**
 * AG_ERROR_SEVERITY Unit Tests
 *
 * Tests the AG_ERROR_SEVERITY constant validation functions, focusing on
 * AG_isValidErrorSeverity function with various input types and edge cases.
 */
describe('Given AG_ERROR_SEVERITY constant values', () => {
  /**
   * AG_isValidErrorSeverity Function Tests
   *
   * Tests the validation function with valid severity values, edge cases,
   * and special JavaScript values to ensure robust type checking.
   */
  describe('When validating with AG_isValidErrorSeverity', () => {
    // Test: Valid severity value acceptance
    it('Then 正常系：should accept valid severity values', () => {
      // Arrange & Act & Assert
      expect(AG_isValidErrorSeverity(AG_ERROR_SEVERITY.FATAL)).toBe(true);
      expect(AG_isValidErrorSeverity(AG_ERROR_SEVERITY.ERROR)).toBe(true);
      expect(AG_isValidErrorSeverity(AG_ERROR_SEVERITY.WARNING)).toBe(true);
      expect(AG_isValidErrorSeverity(AG_ERROR_SEVERITY.INFO)).toBe(true);
    });

    // Test: Invalid value rejection - edge cases and special values
    it('Then エッジケース：should reject invalid values', () => {
      // Arrange
      const invalidValues = [
        '', // whitespace
        ' ',
        '\t',
        '\n',
        'FATAL', // case variants
        'Error',
        'WARNING',
        'Info',
        '0', // numeric strings
        '1',
        '-1',
        Symbol('error'), // special JS values
        BigInt(1),
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];

      // Act & Assert
      invalidValues.forEach((value) => {
        expect(AG_isValidErrorSeverity(value)).toBe(false);
      });
    });
  });
});
