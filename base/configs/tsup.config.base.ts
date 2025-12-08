// src: shared/configs/tsup.config.base.ts
// @(#) : tsup base configuration
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import process from 'node:process';
import { dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

// types
import type { Plugin as EsbuildPlugin } from 'esbuild';
import type { Options } from 'tsup';

// ✅ __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// plugins
/**
 * 型安全な alias → 相対パス変換 plugin
 */
export const createAliasRewritePlugin = (aliases: Record<string, string>): EsbuildPlugin => ({
  name: 'alias-to-relative',
  setup(build) {
    const baseDir = process.cwd();
    build.onResolve({ filter: /.*/ }, (args) => {
      for (const key in aliases) {
        if (!args.path.startsWith(key)) { continue; }

        const mapped = args.path.replace(key, aliases[key]);
        const abs = path.resolve(mapped); // CWD 基準で十分
        const importerDir = args.importer ? path.dirname(args.importer) : baseDir;
        const rel = path.relative(importerDir, abs);

        return { path: rel.startsWith('.') ? rel : `./${rel}` };
      }
      return null;
    });
  },
});

// base configs: to be extended per package
export const baseConfig: Options = {
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  shims: false,
  outDir: undefined, // overwrite it per package
  entry: [], // must overwrite per package

  esbuildPlugins: [ // set alias per package
  ],
};
