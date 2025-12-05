// src: shared/common/configs/eslint.config.typed.js
// @(#) : ESLint flat config for type check
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// resolve root directory
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, '..');

// import form common base config
import { createTypedConfig } from '../../../../base/configs/eslint.config.typed.base.js';

export default createTypedConfig({
  files: [
    'index.ts',
    'src/**/*.ts',
    'types/**/*.ts',
    'tests/**/*.ts',
  ],
  projectPaths: ['./tsconfig.json'],
  tsconfigRootDir: __rootDir,
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
});
