// src: types/AglaErrorOptions.types.ts
// @(#) : Type definitions for AglaError options and context
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Internal type definitions
import type { AGT_ErrorSeverity } from './ErrorSeverity.types.js';

/**
 * Context information type for AglaError instances.
 * Replaces generic Record<string, unknown> with structured context type.
 */
export type AglaErrorContext = {
  [key: string]: unknown;
};

/**
 * Validates if a value is a valid AglaErrorContext.
 * @param value - The value to validate
 * @returns true if value is valid AglaErrorContext, false otherwise
 */

export const isValidAglaErrorContext = (value: unknown): value is AglaErrorContext =>
  typeof value === 'object' && value !== null;

/**
 * Type guard function that validates and returns AglaErrorContext.
 * @param value - The value to guard
 * @returns The validated AglaErrorContext
 * @throws Error if value is not valid AglaErrorContext
 */
export const guardAglaErrorContext = (value: unknown): AglaErrorContext => {
  if (!isValidAglaErrorContext(value)) {
    throw new Error('Invalid AglaErrorContext: expected object, got ' + typeof value);
  }
  return value;
};

/**
 * Options for creating AglaError instances with extended functionality.
 */
export type AglaErrorOptions = {
  /** The error code for identification and categorization */
  readonly code?: string;
  /** The severity level of this error */
  readonly severity?: AGT_ErrorSeverity;
  /** The timestamp when this error was created */
  readonly timestamp?: Date;
  /** Optional context information for debugging */
  readonly context?: AglaErrorContext;
  /** The underlying cause of this error */
  readonly cause?: string;
};
