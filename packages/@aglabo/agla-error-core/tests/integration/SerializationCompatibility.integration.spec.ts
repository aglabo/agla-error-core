// src: tests/integration/SerializationCompatibility.integration.spec.ts
// @(#): Serialization compatibility integration tests (round-trip, formats, streaming)
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
 * Serialization compatibility integration tests
 * Tests JSON round-trip consistency and format compatibility across serialization scenarios
 */
describe('Serialization Compatibility', () => {
  /**
   * JSON round-trip serialization tests
   */
  describe('JSON round-trip', () => {
    // Round-trip consistency: maintains data integrity through JSON parse/stringify cycle
    it('maintains round-trip consistency', () => {
      const timestamp = new Date('2025-09-01T00:00:00.000Z');
      const error = new TestAglaError('ROUND_TRIP', 'Round trip test', {
        code: 'RT001',
        severity: AG_ERROR_SEVERITY.INFO,
        timestamp,
        context: { a: 1, b: 'two', nested: { ok: true } },
      });

      const originalJson = error.toJSON();
      const roundTripped = JSON.parse(JSON.stringify(originalJson));

      expect(roundTripped).toEqual({
        errorType: 'ROUND_TRIP',
        message: '[TEST] Round trip test',
        code: 'RT001',
        severity: AG_ERROR_SEVERITY.INFO,
        timestamp: timestamp.toISOString(),
        context: { a: 1, b: 'two', nested: { ok: true } },
      });
      expect(roundTripped).toEqual(originalJson);
    });
  });

  describe('Format conversion', () => {
    it('preserves core fields across formats', () => {
      const error = new TestAglaError('MULTI_FORMAT', 'Multi format test', {
        code: 'MF001',
        severity: AG_ERROR_SEVERITY.ERROR,
        context: { format: 'multi', conversion: true },
      });

      const jsonFormat = error.toJSON();
      const xmlFormat = `<error><errorType>${error.errorType}</errorType><message>${error.message}</message></error>`;
      const stringFormat = error.toString();

      expect(xmlFormat).toContain(error.errorType);
      expect(xmlFormat).toContain(error.message);
      expect(stringFormat).toContain(error.errorType);
      expect(stringFormat).toContain(error.message);
      expect(jsonFormat.errorType).toBe('MULTI_FORMAT');
    });
  });

  describe('Streaming-like serialization', () => {
    it('supports chunked concatenation equivalence', () => {
      const largeContext = {
        data: new Array(1000).fill('streaming-data'),
        metadata: { size: 1000, type: 'stream' },
      };
      const error = new TestAglaError('STREAMING_TEST', 'Streaming serialization test', { context: largeContext });

      const json = JSON.stringify(error.toJSON());
      const chunks: string[] = [];
      const chunkSize = 100;
      for (let i = 0; i < json.length; i += chunkSize) { chunks.push(json.slice(i, i + chunkSize)); }
      const streamed = chunks.join('');

      expect(streamed).toBe(json);
      expect(streamed).toContain(error.message);
      expect(chunks.length).toBeGreaterThan(1);
      expect(JSON.parse(streamed)).toEqual(error.toJSON());
    });
  });

  describe('Unicode safety', () => {
    it('preserves non-ASCII characters in message and context', () => {
      const error = new TestAglaError('UNICODE', '日本語とemoji😀', {
        context: { note: 'メモ📝', city: '東京' },
      });
      const rt = JSON.parse(JSON.stringify(error.toJSON()));
      expect(rt.message).toBe('[TEST] 日本語とemoji😀');
      expect(rt.context.note).toBe('メモ📝');
      expect(rt.context.city).toBe('東京');
    });
  });
});
