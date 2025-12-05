// src: shared/common/configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, '..'); // packages/@aglabo/ag-logger

// plugins
// import tseslint from 'typescript-eslint';

// import form common base config
import baseConfig from '../../../../base/configs/eslint.config.base.js';

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'src/**/*.ts',
      'shared/**/*.ts',
      'tests/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __rootDir,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__rootDir, 'tsconfig.json'),
          alwaysTryTypes: true,
        },
      },
    },
  },
];
