// src: src/__tests__/helpers/TestAglaError.class.ts
// @(#) : Test utility class for AglaError testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions
import type { AglaErrorOptions } from '@shared/types/AglaError.types';
import { AglaError } from '@shared/types/AglaError.types';

/**
 * Test utility class extending AglaError for testing purposes.
 * Provides concrete implementation with [TEST] prefix for test identification.
 */
export class TestAglaError extends AglaError {
  /**
   * Creates a new TestAglaError instance for testing.
   * Automatically adds [TEST] prefix to message for test identification.
   * @param errorType - The error type identifying the specific type of error
   * @param message - The human-readable error message (without [TEST] prefix)
   * @param options - Optional configuration including code, severity, timestamp, and context
   */
  constructor(
    errorType: string,
    message: string,
    options?: AglaErrorOptions,
  ) {
    // Only add [TEST] if not already present
    const finalMessage = message.startsWith('[TEST]') ? message : `[TEST] ${message}`;
    super(errorType, finalMessage, options);
  }
}

/**
 * Basic implementation of AglaError without method overrides.
 * Used to test the base chain functionality without inheritance customization.
 */
export class BasicAglaError extends AglaError {
  /**
   * Creates a new BasicAglaError instance without any customization.
   * This demonstrates using AglaError directly without overriding methods.
   */
  constructor(
    errorType: string,
    message: string,
    options?: AglaErrorOptions,
  ) {
    super(errorType, message, options);
  }

  // 継承のみ、メソッドのオーバーライドなし
}
