// src: src/__tests__/helpers/test-types.types.ts
// @(#): Test utility type definitions for AglaError testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions
import type { AglaErrorContext } from '@shared/types/AglaError.types';

/**
 * Utility type that makes all readonly properties of T mutable.
 * Useful for testing scenarios where readonly properties need to be modified.
 *
 * @template T - The type to make mutable
 * @example
 * ```typescript
 * type ReadonlyUser = { readonly id: number; readonly name: string };
 * type MutableUser = _TMutable<ReadonlyUser>; // { id: number; name: string }
 * ```
 */
export type _TMutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Generic test buffer type for testing scenarios requiring flexible object structures.
 * Allows any string key with unknown values, useful for mock data and edge case testing.
 *
 * @example
 * ```typescript
 * const testBuffer: _TTestBuffer = {
 *   mockData: 'test',
 *   count: 42,
 *   nested: { foo: 'bar' }
 * };
 * ```
 */
export type _TTestBuffer = {
  [key: string]: unknown;
};

/**
 * Test error statistics type for testing error counting and aggregation scenarios.
 * Maps error categories or types to their occurrence counts.
 *
 * @example
 * ```typescript
 * const errorStats: _TErrorStatistics = {
 *   'VALIDATION_ERROR': 5,
 *   'NETWORK_ERROR': 2,
 *   'AUTH_ERROR': 1
 * };
 * ```
 */
export type _TErrorStatistics = {
  [key: string]: number;
};

/**
 * Extended AglaErrorContext type with symbol properties for advanced edge case testing.
 * Used to test symbol key handling in error contexts, ensuring proper serialization
 * and access patterns for non-string object keys.
 *
 * @example
 * ```typescript
 * const symbolKey = Symbol('testKey');
 * const contextWithSymbols: _TAglaErrorContextWithSymbols = {
 *   userId: '123',
 *   [symbolKey]: 'hidden-value'
 * };
 * ```
 */
export type _TAglaErrorContextWithSymbols = AglaErrorContext & {
  [key: symbol]: unknown;
};

/**
 * HTTP headers type for testing scenarios involving request/response header simulation.
 * Represents typical HTTP header structure with string key-value pairs.
 *
 * @example
 * ```typescript
 * const headers: _THttpHeaders = {
 *   'Content-Type': 'application/json',
 *   'Authorization': 'Bearer token123',
 *   'X-Request-ID': 'req-456'
 * };
 * ```
 */
export type _THttpHeaders = {
  [header: string]: string;
};
