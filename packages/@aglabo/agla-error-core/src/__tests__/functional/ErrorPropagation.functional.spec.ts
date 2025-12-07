// src: src/__tests__/functional/ErrorPropagation.functional.spec.ts
// @(#): Error propagation functional tests (multi-level chaining and function boundaries)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError } from '@shared/types/AglaError.types';
import { AG_ERROR_SEVERITY } from '@shared/types/ErrorSeverity.types';

// Test utilities
import { TestAglaError } from '@tests/_helpers/TestAglaError.class';

// Test cases
/**
 * Error Propagation Functional Tests
 *
 * Tests multi-level error chaining and propagation across function boundaries,
 * validating property preservation and context enrichment.
 */
describe('Error Propagation', () => {
  /**
   * Multi-level Error Chaining Tests
   *
   * Tests property preservation and ES2022 cause chain through
   * multiple levels of error chaining.
   */
  describe('Multi-level chaining', () => {
    // Test: Property preservation through multiple chaining levels with ES2022 cause
    it('preserves base properties across levels and sets ES2022 cause chain', () => {
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const base = new TestAglaError('MULTI_LEVEL_ERROR', 'Base level error', {
        code: 'ML_001',
        severity: AG_ERROR_SEVERITY.FATAL,
        timestamp,
        context: { level: 0, module: 'base' },
      });

      const level1 = base.chain(new Error('Level 1 failure'));
      const level2 = level1.chain(new Error('Level 2 failure'));
      const finalE = level2.chain(new Error('Final failure'));

      // ES2022 standard: message is preserved from base, cause is set at each level
      expect(finalE.message).toBe('[TEST] Base level error');
      expect((finalE as Error).cause).toBeInstanceOf(Error);
      expect(((finalE as Error).cause as Error).message).toBe('Final failure');

      // Base properties are preserved
      expect(finalE.errorType).toBe('MULTI_LEVEL_ERROR');
      expect(finalE.code).toBe('ML_001');
      expect(finalE.severity).toBe(AG_ERROR_SEVERITY.FATAL);
      expect(finalE.context).toHaveProperty('level', 0);
      expect(finalE.context).toHaveProperty('module', 'base');
      expect(finalE.name).toBe('TestAglaError');
      expect(finalE.stack).toBeDefined();
    });
  });

  /**
   * Function Boundary Propagation Tests
   *
   * Tests error propagation across different function contexts using ES2022 cause chain,
   * simulating service and controller layer interactions.
   */
  describe('Propagation across function boundaries', () => {
    /**
     * Simulates a service layer error with database failure.
     * This mock function demonstrates error creation and chaining at the service layer,
     * simulating a database connection failure and wrapping it in a structured AglaError.
     *
     * @returns AglaError with service context and chained database failure cause
     * @example
     * ```typescript
     * const serviceError = service();
     * expect(serviceError.code).toBe('SVC_001');
     * expect(serviceError.context).toHaveProperty('component', 'service');
     * ```
     */
    const service = (): AglaError => {
      try {
        // Simulate low-level failure
        throw new Error('DB not reachable');
      } catch (e) {
        return new TestAglaError('SERVICE_ERROR', 'Service failed', {
          code: 'SVC_001',
          severity: AG_ERROR_SEVERITY.ERROR,
          context: { component: 'service' },
        }).chain(e as Error);
      }
    };

    /**
     * Simulates a controller layer error that enriches service error.
     * This mock function demonstrates error propagation and enrichment across layers,
     * taking a service layer error and adding controller-specific context through chaining.
     *
     * @returns AglaError with additional controller context and enriched error chain
     * @example
     * ```typescript
     * const controllerError = controller();
     * expect(controllerError.message).toContain('Controller observed failure');
     * expect(controllerError.context).toHaveProperty('component', 'service');
     * ```
     */
    const controller = (): AglaError => {
      const err = service();
      // enrich at controller level
      return err.chain(new Error('Controller observed failure'));
    };

    // Test: Cross-boundary propagation with ES2022 cause chain
    it('keeps severity, preserves context, and maintains ES2022 cause chain', () => {
      const propagated = controller();
      expect(propagated.severity).toBe(AG_ERROR_SEVERITY.ERROR);
      expect(propagated.context).toHaveProperty('component', 'service');

      // Cause chain: controller error -> service error (with DB error as cause)
      expect((propagated as Error).cause).toBeInstanceOf(Error);
      expect(((propagated as Error).cause as Error).message).toBe('Controller observed failure');

      const json = propagated.toJSON();
      expect(json).toHaveProperty('code', 'SVC_001');
      expect(json).toHaveProperty('severity', AG_ERROR_SEVERITY.ERROR);
    });
  });
});
