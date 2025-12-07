// src: types/AglaError.types.ts
// @(#) : Re-exports for unified error handling types (backward compatibility)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Re-export option types
export type {
  AglaErrorContext,
  AglaErrorOptions,
} from './AglaErrorOptions.types.js';

export {
  guardAglaErrorContext,
  isValidAglaErrorContext,
} from './AglaErrorOptions.types.js';

// Re-export class and constructor type
export type { AglaErrorConstructor } from './AglaError.class.js';
export { AglaError } from './AglaError.class.js';
