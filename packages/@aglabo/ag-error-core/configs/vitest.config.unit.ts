// src: shared/common/configs/vitest.config.unit.ts
// @(#) : vitest config for unit test
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
      // Unit Test - pure unit tests for individual functions/methods
      'src/**/__tests__/**/*.spec.ts',
      'src/**/__tests__/**/*.test.ts',
    ],
    exclude: [
      'src/**/__tests__/functional/**/*',
      'src/**/__tests__/runtime/**/*',
      'tests/**/*',
    ],
    cacheDir: path.resolve(__rootDir, '.cache/vitest-cache/unit/'),
    // sequential test execution to avoid singleton state conflicts
    sequence: {
      concurrent: false,
    },
    //
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov'],
      reportsDirectory: path.resolve(__rootDir, 'coverage/unit'),
    },
  },
});
