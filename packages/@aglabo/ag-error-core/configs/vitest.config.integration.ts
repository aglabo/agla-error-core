// src: shared/common/configs/vitest.config.ci.ts
// @(#) : vitest config for CI test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs for base directory
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// base directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, '../');

// plugins
import tsconfigPaths from 'vite-tsconfig-paths';

// system config
import { mergeConfig } from 'vitest/config';

// shared base config
import baseConfig from '../../../../base/configs/vitest.config.base.ts';

// config
export default mergeConfig(baseConfig, {
  plugins: [tsconfigPaths()],
  test: {
    include: [
      // CI (Integration) Tests
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.spec.ts',
    ],
    exclude: [
      '**/__tests__/*',
    ],
    cacheDir: path.resolve(__rootDir, '.cache/vitest-cache/ci/'),
    // parallel test
    sequence: {
      concurrent: true,
    },
    //
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov'],
      reportsDirectory: path.resolve(__rootDir, 'coverage/integration'),
    },
  },
});
