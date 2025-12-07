// src: types/index.ts
// @(#) : Shared TypeScript types barrel file for unified type definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Error handling types
export * from './AglaError.types';
export {
  AG_ERROR_SEVERITY,
  AG_ERROR_SEVERITY_VALUES,
  AG_isValidErrorSeverity,
} from './ErrorSeverity.types';
export type { AGT_ErrorSeverity } from './ErrorSeverity.types';
