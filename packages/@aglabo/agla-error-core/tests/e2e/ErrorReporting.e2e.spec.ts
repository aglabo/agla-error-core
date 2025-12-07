// src: tests/e2e/ErrorReporting.e2e.spec.ts
// @(#): Error reporting E2E tests (formatting, default codes, multi-level chaining)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

/**
 * Formats AglaError for action report display
 * @param e - TestAglaError instance to format
 * @returns Formatted string with code, errorType, and message
 */
const toActionFormat = (e: TestAglaError): string => {
  const code = e.toJSON().code ?? 'GA001';
  return `[${code}] ${e.errorType}: ${e.message}`;
};

/**
 * Error reporting E2E tests
 * Tests real-world error reporting scenarios with formatting and code assignment
 */
describe('Error Reporting', () => {
  // Default code assignment: uses GA001 when no explicit code provided in chained errors
  it('formats chained error with default code when absent', () => {
    const base = new TestAglaError('PIPELINE', 'Step failed');
    const chained = base.chain(new Error('Tool not found'));
    const line = toActionFormat(chained);
    expect(line).toContain('[GA001]');
    expect(line).toContain('PIPELINE');
    expect(line).toContain('[TEST] Step failed');
    // ES2022: cause is separate, not in message
    expect((chained as Error).cause).toBeInstanceOf(Error);
    expect(((chained as Error).cause as Error).message).toBe('Tool not found');
  });

  // Explicit property preservation: maintains user-provided codes and severity levels
  it('keeps explicit code and severity in JSON report', () => {
    const e = new TestAglaError('DEPLOY', 'Deploy error', { code: 'DEP_01', severity: AG_ERROR_SEVERITY.ERROR });
    const json = e.toJSON();
    expect(json).toHaveProperty('code', 'DEP_01');
    expect(json).toHaveProperty('severity', AG_ERROR_SEVERITY.ERROR);
  });
});
