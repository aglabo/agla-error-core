// src: src/__tests__/functional/CompleteWorkflows.functional.spec.ts
// @(#): Complete workflow functional tests (serialization and chaining)
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
import { BasicAglaError } from '@tests/_helpers/TestAglaError.class';

// Test cases
/**
 * Complete Workflow Functional Tests
 *
 * Tests end-to-end scenarios combining error chaining, serialization,
 * and context merging in realistic workflow scenarios.
 */
describe('Complete Workflows', () => {
  /**
   * Error Chaining Workflow Tests
   *
   * Tests complete error chaining workflow using ES2022 Error.cause standard,
   * including message preservation, cause setting, and serialization in integrated scenarios.
   */
  describe('Error chaining workflow', () => {
    // Test: Complete chaining workflow with ES2022 Error.cause standard
    it('preserves message, sets cause, and maintains errorType and context', () => {
      const originalError = new BasicAglaError(
        'WORKFLOW_ERROR',
        'Original workflow message',
        {
          code: 'WF_001',
          severity: AG_ERROR_SEVERITY.ERROR,
          context: { userId: '123', operation: 'workflow' },
        },
      );
      const causeError = new Error('Underlying system failure');

      const chainedError = originalError.chain(causeError);

      // ES2022 standard: message is preserved, cause is set
      expect(chainedError.message).toBe('Original workflow message');
      expect((chainedError as Error).cause).toBe(causeError);
      expect(chainedError.errorType).toBe('WORKFLOW_ERROR');
      expect(chainedError.context).toEqual({
        userId: '123',
        operation: 'workflow',
      });

      const json = chainedError.toJSON();
      expect(json).toEqual({
        errorType: 'WORKFLOW_ERROR',
        message: 'Original workflow message',
        code: 'WF_001',
        severity: AG_ERROR_SEVERITY.ERROR,
        context: chainedError.context,
      });

      const stringRepresentation = chainedError.toString();
      expect(stringRepresentation).toContain('WORKFLOW_ERROR');
      expect(stringRepresentation).toContain('Original workflow message');
      expect(stringRepresentation).toContain(JSON.stringify(chainedError.context));
    });
  });

  /**
   * Complex Serialization Workflow Tests
   *
   * Tests serialization of deeply nested contexts and complex data
   * structures with preservation of all field types and values.
   */
  describe('Complex serialization workflow', () => {
    // Test: Deep serialization with nested objects and arrays
    it('serializes deeply nested context and preserves fields', () => {
      const complexContext = {
        user: { id: '123', name: 'John Doe', roles: ['admin', 'user'] },
        operation: { type: 'CREATE', resource: 'document', metadata: { version: '1.0', tags: ['important', 'draft'] } },
        system: { hostname: 'server01', pid: 1234, memory: 512 },
      };

      const error = new BasicAglaError(
        'COMPLEX_SERIALIZATION_ERROR',
        'Complex data serialization test',
        {
          code: 'CS_001',
          severity: AG_ERROR_SEVERITY.WARNING,
          timestamp: new Date('2025-12-31T23:59:59.999Z'),
          context: complexContext,
        },
      );

      const json = error.toJSON();
      const parsed = JSON.parse(JSON.stringify(json));

      expect(json).toHaveProperty('errorType', 'COMPLEX_SERIALIZATION_ERROR');
      expect(json).toHaveProperty('message', 'Complex data serialization test');
      expect(json).toHaveProperty('code', 'CS_001');
      expect(json).toHaveProperty('severity', AG_ERROR_SEVERITY.WARNING);
      expect(json).toHaveProperty('timestamp', '2025-12-31T23:59:59.999Z');
      expect(json).toHaveProperty('context');
      expect(json.context).toEqual(complexContext);

      expect(parsed.context.user.roles).toEqual(['admin', 'user']);
      expect(parsed.context.operation.metadata.tags).toEqual(['important', 'draft']);
    });
  });
});
