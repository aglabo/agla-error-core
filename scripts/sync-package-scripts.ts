#!/usr/bin/env tsx
// src: scripts/sync-package-scripts.ts
//
// @(#) : Sync base scripts into target directory's package.json
//
// Copyright (c) 2025 Furukawa Atsushi
// Released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import fs from 'fs';
import path from 'path';

// global
let IS_DRY_RUN = false;

const BASE_SCRIPTS_FILE = 'base-scripts.json';
const TARGET_PACKAGE_FILE = 'package.json';

/**
 * Resolve target and base paths
 */
function resolvePaths(targetDir: string, repoRoot: string): {
  targetPkgPath: string;
  baseScriptsPath: string;
} {
  return {
    targetPkgPath: path.resolve(targetDir, TARGET_PACKAGE_FILE),
    baseScriptsPath: path.resolve(repoRoot, 'base/configs', BASE_SCRIPTS_FILE),
  };
}

function loadJson(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function mergeScripts(
  original: Record<string, string>,
  base: Record<string, string>,
): Record<string, string> {
  return {
    ...original,
    ...base,
  };
}

function updatePackageJson(targetPath: string, updatedPkg: Record<string, any>): void {
  if (IS_DRY_RUN) {
    console.log('🔍 Merged scripts (dry-run):');
    console.log(JSON.stringify(updatedPkg.scripts, null, 2));
  } else {
    fs.writeFileSync(targetPath, JSON.stringify(updatedPkg, null, 2) + '\n');
    console.log('✅ package.json updated:', targetPath);
  }
}

function validateTargetDir(targetDir: string, repoRoot: string): void {
  const normalizedTarget = path.resolve(targetDir);
  const normalizedRoot = path.resolve(repoRoot);

  if (normalizedTarget === normalizedRoot) {
    throw new Error(`🚫 Refusing to write to project root: ${normalizedTarget}`);
  }
}
function syncScripts(targetDir: string, repoRoot: string): void {
  const { targetPkgPath, baseScriptsPath } = resolvePaths(targetDir, repoRoot);

  validateTargetDir(targetDir, repoRoot); // check if target dir is not project root

  const pkgJson = loadJson(targetPkgPath);
  const baseScripts = loadJson(baseScriptsPath).scripts;

  if (!baseScripts) {
    throw new Error("Missing 'scripts' field in base-scripts.json");
  }

  console.log(`📦 Syncing scripts to: ${targetPkgPath}`);
  if (IS_DRY_RUN) {
    console.log('🚫 Dry run mode is active. No changes will be written.');
  }

  // pkgJson.scripts = mergeScripts(pkgJson.scripts ?? {}, baseScripts);
  pkgJson.scripts = baseScripts; // overwrite base scripts
  updatePackageJson(targetPkgPath, pkgJson);
}

function main() {
  const args = process.argv.slice(2);
  const [targetDir, repoRoot, maybeDryRun] = args;

  if (!targetDir || !repoRoot) {
    console.error('❌ Usage: tsx sync-package-scripts.ts <target_dir> <repo_root> [--dry-run]');
    process.exit(1);
  }

  if (maybeDryRun === '--dry-run') {
    IS_DRY_RUN = true;
  }

  try {
    syncScripts(targetDir, repoRoot);
  } catch (err) {
    console.error('❌ Error:', (err as Error).message);
    process.exit(1);
  }
}

main();
