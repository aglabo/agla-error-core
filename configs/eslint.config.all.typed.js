// src: ./configs/eslint.config.all.typed.js
// @(#) : ESLint typed configuration for TypeScript type checking
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

import projectPaths from './eslint.projects.js';
// base configuration
import { createTypedConfig } from '../base/configs/eslint.config.typed.base.js';

// eslint configs
export default createTypedConfig({
  files: [
    'packages/**/*.ts',
    'aggregators/**/*.ts',
  ],
  projectPaths,
  tsconfigRootDir: rootDir,
  settings: {
    'import/resolver': {
      typescript: {
        project: projectPaths,
        tsconfigRootDir: rootDir,
        noWarnOnMultipleProjects: true,
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
});
