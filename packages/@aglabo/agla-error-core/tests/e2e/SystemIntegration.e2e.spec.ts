// src: tests/e2e/SystemIntegration.e2e.spec.ts
// @(#): System integration E2E tests (FS→HTTP→aggregated reporting)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it, vi } from 'vitest';

// Type definitions
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test mocks
const fs = { readFile: vi.fn() };
const http = { get: vi.fn() };

const reportSink = {
  logs: [] as string[],
  push(msg: string) {
    this.logs.push(msg);
  },
};

// Helper functions
const readConfig = async (path: string): Promise<string | TestAglaError> => {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (e) {
    return new TestAglaError('FS_READ', `Cannot read: ${path}`, {
      severity: AG_ERROR_SEVERITY.ERROR,
      context: { path, cause: (e as Error).message },
    });
  }
};

const fetchStatus = async (url: string): Promise<unknown | TestAglaError> => {
  try {
    return await http.get(url);
  } catch (e) {
    return new TestAglaError('HTTP_GET', `GET failed: ${url}`, {
      severity: AG_ERROR_SEVERITY.ERROR,
      context: { url, cause: (e as Error).message },
    });
  }
};

const aggregateReport = (errors: TestAglaError[]): number => {
  errors.forEach((e) => reportSink.push(JSON.stringify(e.toJSON())));
  return reportSink.logs.length;
};

// Test cases
/**
 * System Integration E2E Tests
 *
 * Tests the complete error flow from filesystem reads and HTTP requests
 * through to aggregated error reporting. Validates that errors are properly
 * propagated, transformed into AglaError instances, and collected for reporting.
 */
describe('System Integration', () => {
  it('propagates FS/HTTP failures and aggregates report', async () => {
    fs.readFile.mockRejectedValue(new Error('ENOENT'));
    http.get.mockRejectedValue(new Error('ECONNREFUSED'));

    const fsRes = await readConfig('/etc/app.json');
    const httpRes = await fetchStatus('https://api.example.com/health');

    const errs = [fsRes, httpRes].filter((x): x is TestAglaError => x instanceof TestAglaError);
    const count = aggregateReport(errs);

    expect(count).toBe(2);
    expect(reportSink.logs[0]).toContain('FS_READ');
    expect(reportSink.logs[1]).toContain('HTTP_GET');
  });
});
