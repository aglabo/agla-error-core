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
import { AG_isValidErrorSeverity } from '@shared/types/ErrorSeverity.types';

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
    // Test: Edge case validation - case variants, whitespace, and numeric strings
    it('Then エッジケース：should handle edge case values', () => {
      // Arrange
      const edgeCaseValues = [
        '',
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
      ];

      // Act & Assert
      edgeCaseValues.forEach((value) => {
        expect(AG_isValidErrorSeverity(value)).toBe(false);
      });
    });

    // Test: Special JavaScript value rejection - Symbol, BigInt, and special numerics
    it('Then エッジケース：should handle special JavaScript values', () => {
      // Arrange
      const specialValues = [
        Symbol('error'),
        BigInt(1),
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];

      // Act & Assert
      specialValues.forEach((value) => {
        expect(AG_isValidErrorSeverity(value)).toBe(false);
      });
    });
  });
});
