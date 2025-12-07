// src: types/ErrorSeverity.types.ts
// @(#) : Error Severity Types for unified error handling across all packages
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Error severity levels constant object.
 * Sub-level constant for AglaError system.
 *
 * Naming convention:
 * - AG_ prefix: Sub-level constants used internally by AglaError
 * - Agla prefix: Main-level classes and types
 *
 * Using const assertion provides better type inference and tree-shaking
 * compared to enum while maintaining type safety.
 */
export const AG_ERROR_SEVERITY = {
  /** Critical system failures that require immediate attention and may cause system shutdown */
  FATAL: 'fatal',
  /** Runtime errors that prevent normal operation but allow system to continue */
  ERROR: 'error',
  /** Potential issues that don't prevent operation but should be investigated */
  WARNING: 'warning',
  /** Informational messages about error conditions for debugging purposes */
  INFO: 'info',
} as const;

/**
 * Type representing valid error severity levels.
 * Sub-level type derived from AG_ERROR_SEVERITY for type safety.
 *
 * Naming convention:
 * - AGT_ prefix: Sub-level types derived from AG_ constants
 */
export type AGT_ErrorSeverity = typeof AG_ERROR_SEVERITY[keyof typeof AG_ERROR_SEVERITY];

/**
 * Array of all valid error severity values.
 * Useful for validation and iteration.
 * Sub-level constant array for runtime checks.
 */
export const AG_ERROR_SEVERITY_VALUES = Object.values(AG_ERROR_SEVERITY);

/**
 * Type guard to check if a value is a valid error severity.
 * Sub-level utility function for runtime validation.
 *
 * @param value - Value to validate
 * @returns True if value is a valid AGT_ErrorSeverity
 *
 * @example
 * ```typescript
 * if (AG_isValidErrorSeverity(input)) {
 *   // input is AGT_ErrorSeverity
 * }
 * ```
 */
export const AG_isValidErrorSeverity = (value: unknown): value is AGT_ErrorSeverity => {
  return typeof value === 'string'
    && AG_ERROR_SEVERITY_VALUES.includes(value as AGT_ErrorSeverity);
};
