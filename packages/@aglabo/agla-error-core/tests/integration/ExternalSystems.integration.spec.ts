// src: tests/integration/ExternalSystems.integration.spec.ts
// @(#): External systems integration tests (FS/HTTP/GitHub Actions)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Type definitions
import type { AglaError } from '@shared/types/AglaError.types';
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test mocks
const mockFs = { readFile: vi.fn(), writeFile: vi.fn(), access: vi.fn() };
const mockHttp = { get: vi.fn(), post: vi.fn(), request: vi.fn() };
const mockCore = { setFailed: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };

// Helper functions
/**
 * Handles file operations with error wrapping
 * Simulates filesystem operations and converts native errors to AglaError instances
 */
const handleFileOperation = async (
  filePath: string,
  options?: { fs?: typeof mockFs },
): Promise<{ error?: AglaError; result?: unknown }> => {
  const fs = options?.fs ?? mockFs;
  try {
    return { result: await fs.readFile(filePath, 'utf8') };
  } catch (cause) {
    const error = new TestAglaError('FILE_READ_ERROR', `Failed to read file: ${filePath}`, {
      severity: AG_ERROR_SEVERITY.ERROR,
      context: { filePath, systemCode: (cause as { code?: string }).code, operation: 'readFile' },
    });
    return { error };
  }
};

/**
 * Handles HTTP requests with error wrapping
 * Simulates HTTP operations and converts network errors to AglaError instances
 */
const handleHttpRequest = async (
  url: string,
  options?: { http?: typeof mockHttp },
): Promise<{ error?: AglaError; result?: unknown }> => {
  const http = options?.http ?? mockHttp;
  try {
    return { result: await http.get(url) };
  } catch (cause) {
    const error = new TestAglaError('HTTP_REQUEST_ERROR', `HTTP request failed: ${url}`, {
      severity: AG_ERROR_SEVERITY.ERROR,
      context: { url, method: 'GET', cause: (cause as Error).message },
    });
    return { error };
  }
};

/**
 * Handles GitHub Actions error reporting
 * Formats AglaError instances for GitHub Actions output with proper annotations
 */
const handleGitHubActionsError = (aglaError: AglaError, core = mockCore): void => {
  const actionMessage = `${aglaError.errorType}: ${aglaError.message}`;
  const errorCode = aglaError.code ?? 'GA001';
  core.setFailed(actionMessage);
  core.error(`Error Code: ${errorCode} - ${aglaError.message}`);
  if (aglaError.context) { core.info(`Context: ${JSON.stringify(aglaError.context)}`); }
};

// Test cases
/**
 * External systems integration tests
 * Tests AglaError integration with filesystem, HTTP, and GitHub Actions using mocks
 */
describe('External Systems Integration (mocked)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  /**
   * Filesystem Integration Tests
   *
   * Tests AglaError integration with filesystem operations, focusing on
   * proper error wrapping and context preservation for file system errors.
   */
  describe('Filesystem', () => {
    // Test: ENOENT error wrapping with system context preservation
    it('wraps ENOENT errors with context', async () => {
      const fsError = Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' });
      mockFs.readFile.mockRejectedValue(fsError);
      const res = await handleFileOperation('/nonexistent/file.json', { fs: mockFs });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.systemCode).toBe('ENOENT');
      expect(res.error!.errorType).toBe('FILE_READ_ERROR');
    });
  });

  /**
   * HTTP Integration Tests
   *
   * Tests AglaError integration with HTTP operations, including network
   * error handling, rate limiting, and request context preservation.
   */
  describe('HTTP', () => {
    // Test: Network error wrapping with URL and method context
    it('wraps network errors with url/method in context', async () => {
      const networkError = new Error('ECONNREFUSED: Connection refused');
      mockHttp.get.mockRejectedValue(networkError);
      const res = await handleHttpRequest('https://example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.url).toBe('https://example.com/api');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });

    // Test: HTTP 429 rate limit error handling and status preservation
    it('handles rate limit (429) message propagation', async () => {
      const rateLimit = new Error('429 Too Many Requests');
      mockHttp.get.mockRejectedValue(rateLimit);
      const res = await handleHttpRequest('https://rate.example.com/api', { http: mockHttp });
      expect(res.error).toBeInstanceOf(TestAglaError);
      expect(res.error!.context?.cause).toContain('429');
      expect(res.error!.errorType).toBe('HTTP_REQUEST_ERROR');
    });
  });

  /**
   * GitHub Actions Integration Tests
   *
   * Tests AglaError formatting and output for GitHub Actions environment,
   * including proper annotation formatting and default error code handling.
   */
  describe('GitHub Actions formatting', () => {
    // Test: GitHub Actions error formatting with proper annotations
    it('formats message and emits annotations', () => {
      const agla = new TestAglaError('GITHUB_ACTION_ERROR', 'Action execution failed', {
        code: 'GA001',
        severity: AG_ERROR_SEVERITY.ERROR,
        context: { workflow: 'test-workflow', step: 'tool-installation' },
      });
      handleGitHubActionsError(agla, mockCore);
      expect(mockCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('GITHUB_ACTION_ERROR'));
      expect(mockCore.error).toHaveBeenCalledWith(expect.stringContaining('GA001'));
      expect(mockCore.info).toHaveBeenCalled();
    });

    // Test: Default error code assignment when none specified
    it('applies default error code when not provided (GA001)', () => {
      const agla = new TestAglaError('GITHUB_ACTION_ERROR', 'No code provided');
      handleGitHubActionsError(agla, mockCore);
      // 1回以上呼ばれていること
      expect(mockCore.error).toHaveBeenCalledWith(
        expect.stringContaining('GA001'),
      );
    });
  });
});
