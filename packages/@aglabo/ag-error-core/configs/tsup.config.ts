// src: shared/common/configs/tsup.config.module.ts
// @(#) : tsup config for ESM module
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// system config
import { defineConfig } from 'tsup';

// user config
import { baseConfig, createAliasRewritePlugin } from '../base/configs/tsup.config.base.ts';

// configs
export default defineConfig({
  ...baseConfig,

  // entry points
  entry: {
    'index': './src/index.ts',
  },

  // sub-packages definition
  format: ['esm'],
  outDir: 'module', // for ESM
  // tsconfig
  tsconfig: './tsconfig.json',
  // DTS with incremental build for ESM
  dts: true,
  // esbuild plugins
  esbuildPlugins: [
    // alias rewrite plugin
    createAliasRewritePlugin({
      '@shared': './shared',
      '@runtime': './src/runtime',
    }),
  ],
});
