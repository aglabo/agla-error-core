// src: shared/common/configs/vitest.config.runtime.ts
// @(#) : vitest config for runtime tests
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// plugins
import tsconfigPaths from 'vite-tsconfig-paths';

// libs for base directory
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// base directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, '../');

// system config
import { mergeConfig } from 'vitest/config';

// shared base config
import baseConfig from '../../../../base/configs/vitest.config.base.ts';

// config
export default mergeConfig(baseConfig, {
  plugins: [tsconfigPaths()],
  test: {
    include: [
      // Runtime Test - tests that run in actual runtime environments
      'src/__tests__/runtime/node/*.spec.ts',
      'src/__tests__/runtime/node/*.test.ts',
      // Note: Bun tests are in src/__tests__/runtime/bun/*.spec.ts
      //       but they are run using Bun's native test runner (see package.json test:runtime:bun)
      // Note: Deno tests are in src/__tests__/runtime/deno/*.spec.ts
      //       but they are run using Deno's native test runner (see package.json test:runtime:deno)
    ],
    exclude: [
      'tests/**/*',
    ],
    cacheDir: path.resolve(__rootDir, '.cache/vitest-cache/runtime/'),
    // sequential test execution to avoid runtime conflicts
    sequence: {
      concurrent: false,
    },
    //
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov'],
      reportsDirectory: path.resolve(__rootDir, 'coverage/runtime'),
    },
  },
});
