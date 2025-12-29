#!/usr/bin/env tsx
// src: scripts/analyze-coverage.ts
//
// @(#) : Analyze coverage reports from multiple test layers
//
// Copyright (c) 2025 Furukawa Atsushi
// Released under the MIT License.
// https://opensource.org/licenses/MIT

import fs from 'node:fs';
import process from 'node:process';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Location information for code coverage
 */
interface Location {
  line: number;
  column: number;
}

/**
 * Range information for code coverage
 */
interface Range {
  start: Location;
  end: Location;
}

/**
 * Statement execution count mapping
 */
type StatementMap = Record<string, number>;

/**
 * Function execution count mapping
 */
type FunctionMap = Record<string, number>;

/**
 * Branch execution count mapping (array per branch)
 */
type BranchMap = Record<string, number[]>;

/**
 * Line execution count mapping
 */
type LineMap = Record<string, number>;

/**
 * Statement location mapping
 */
type StatementLocationMap = Record<string, Range>;

/**
 * Coverage data for a single file
 */
interface FileCoverageData {
  path: string;
  s?: StatementMap;
  f?: FunctionMap;
  b?: BranchMap;
  l?: LineMap;
  statementMap?: StatementLocationMap;
  fnMap?: Record<string, unknown>;
  branchMap?: Record<string, unknown>;
}

/**
 * Coverage data structure from coverage-final.json
 */
type CoverageData = Record<string, FileCoverageData>;

/**
 * Path information for coverage file
 */
interface PathInfo {
  readonly package: string;
  readonly layer: string;
  readonly path: string;
}

/**
 * Path information with loaded coverage data
 */
interface CoverageResult extends PathInfo {
  readonly data: CoverageData;
}

/**
 * Metric with coverage statistics
 */
interface Metric {
  readonly total: number;
  readonly covered: number;
  readonly pct: string;
}

/**
 * Coverage statistics for all metrics
 */
interface Stats {
  readonly statements: Metric;
  readonly functions: Metric;
  readonly branches: Metric;
  readonly lines: Metric;
}

/**
 * Result type for error handling (functional approach)
 */
type Result<T, E = Error> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

// ============================================================================
// Constants
// ============================================================================

const PACKAGES = ['agla-error-core'] as const;
const TEST_LAYERS = ['unit', 'functional', 'integration', 'e2e', 'runtime'] as const;

type PackageName = typeof PACKAGES[number];
type TestLayer = typeof TEST_LAYERS[number];

// ============================================================================
// Functional Programming Utilities
// ============================================================================

/**
 * Create successful Result
 */
const ok = <T>(value: T): Result<T, never> => ({ success: true, value });

/**
 * Create failed Result
 */
const err = <E>(error: E): Result<never, E> => ({ success: false, error });

// ============================================================================
// Pure Domain Logic
// ============================================================================

/**
 * Generate coverage file paths for all packages and test layers
 */
const generateCoveragePaths = (): readonly PathInfo[] =>
  [...PACKAGES].flatMap((pkg: PackageName) =>
    [...TEST_LAYERS].map((layer: TestLayer): PathInfo => ({
      package: pkg,
      layer,
      path: `packages/@aglabo/${pkg}/coverage/${layer}/coverage-final.json`,
    }))
  );

/**
 * Calculate percentage from total and covered
 */
const calculatePercentage = (covered: number, total: number): string =>
  total > 0 ? ((covered / total) * 100).toFixed(2) : '0.00';

/**
 * Add percentage to metric
 */
const withPercentage = (metric: Omit<Metric, 'pct'>): Metric => ({
  ...metric,
  pct: calculatePercentage(metric.covered, metric.total),
});

/**
 * Count covered items in a numeric array/record
 */
const countCovered = (items: readonly number[]): number => items.filter((count) => count > 0).length;

/**
 * Extract line hits from statement map and execution counts
 */
const extractLineHits = (
  statementMap: StatementLocationMap,
  statements: StatementMap,
): Map<number, number> => {
  const lineHits = new Map<number, number>();

  Object.entries(statementMap).forEach(([stmtId, location]) => {
    if (location?.start && typeof location.start.line === 'number') {
      const line = location.start.line;
      const count = statements[stmtId] || 0;
      lineHits.set(line, Math.max(lineHits.get(line) || 0, count));
    }
  });

  return lineHits;
};

/**
 * Calculate statements coverage metric
 */
const calculateStatementsMetric = (coverageData: CoverageData): Metric => {
  const allStatements = Object.values(coverageData)
    .filter((file) => file.s)
    .flatMap((file) => Object.values(file.s!));

  return withPercentage({
    total: allStatements.length,
    covered: countCovered(allStatements),
  });
};

/**
 * Calculate functions coverage metric
 */
const calculateFunctionsMetric = (coverageData: CoverageData): Metric => {
  const allFunctions = Object.values(coverageData)
    .filter((file) => file.f)
    .flatMap((file) => Object.values(file.f!));

  return withPercentage({
    total: allFunctions.length,
    covered: countCovered(allFunctions),
  });
};

/**
 * Calculate branches coverage metric
 */
const calculateBranchesMetric = (coverageData: CoverageData): Metric => {
  const allBranches = Object.values(coverageData)
    .filter((file) => file.b)
    .flatMap((file) => Object.values(file.b!))
    .filter((branchData) => Array.isArray(branchData))
    .flat();

  return withPercentage({
    total: allBranches.length,
    covered: countCovered(allBranches),
  });
};

/**
 * Calculate lines coverage metric
 */
const calculateLinesMetric = (coverageData: CoverageData): Metric => {
  const filesWithLines = Object.values(coverageData).filter((file) => file.l);
  const filesWithStatementMap = Object.values(coverageData).filter((file) => file.statementMap && file.s);

  if (filesWithLines.length > 0) {
    const allLines = filesWithLines.flatMap((file) => Object.entries(file.l!));
    return withPercentage({
      total: allLines.length,
      covered: allLines.filter(([, count]) => count > 0).length,
    });
  }

  // v8 format: extract line numbers from statementMap
  const allLineHits = filesWithStatementMap
    .map((file) => extractLineHits(file.statementMap!, file.s!))
    .flatMap((lineHits) => [...lineHits.values()]);

  return withPercentage({
    total: allLineHits.length,
    covered: countCovered(allLineHits),
  });
};

/**
 * Calculate coverage statistics from coverage data (pure function)
 * Composes individual metric calculations into a complete Stats object
 */
const calculateStats = (coverageData: CoverageData): Stats => ({
  statements: calculateStatementsMetric(coverageData),
  functions: calculateFunctionsMetric(coverageData),
  branches: calculateBranchesMetric(coverageData),
  lines: calculateLinesMetric(coverageData),
});

/**
 * Merge numeric maps taking the maximum value for each key
 * Used for statements, functions, and lines coverage data
 */
const mergeNumericMaps = (
  existing: Record<string, number> = {},
  incoming: Record<string, number> = {},
): Record<string, number> =>
  Object.entries(incoming).reduce(
    (merged, [key, value]) => ({
      ...merged,
      [key]: Math.max(merged[key] || 0, value || 0),
    }),
    existing,
  );

/**
 * Merge branch arrays taking the maximum value for each index
 */
const mergeBranchArrays = (
  existing: number[] = [],
  incoming: number[] = [],
): number[] => incoming.map((value, index) => Math.max(existing[index] || 0, value || 0));

/**
 * Merge branch maps
 */
const mergeBranchMaps = (
  existing: BranchMap = {},
  incoming: BranchMap = {},
): BranchMap =>
  Object.entries(incoming)
    .filter(([, branchArray]) => Array.isArray(branchArray))
    .reduce(
      (merged, [key, branchArray]) => ({
        ...merged,
        [key]: mergeBranchArrays(merged[key], branchArray),
      }),
      existing,
    );

/**
 * Merge two file coverage data objects
 */
const mergeFileCoverage = (
  existing: FileCoverageData,
  incoming: FileCoverageData,
): FileCoverageData => ({
  ...existing,
  ...(incoming.s && { s: mergeNumericMaps(existing.s, incoming.s) }),
  ...(incoming.f && { f: mergeNumericMaps(existing.f, incoming.f) }),
  ...(incoming.b && { b: mergeBranchMaps(existing.b, incoming.b) }),
  ...(incoming.l && { l: mergeNumericMaps(existing.l, incoming.l) }),
  ...(incoming.statementMap && {
    statementMap: { ...existing.statementMap, ...incoming.statementMap },
  }),
});

/**
 * Merge coverage data from a single source into accumulated coverage
 */
const mergeSingleCoverage = (
  accumulated: CoverageData,
  incoming: CoverageData,
): CoverageData =>
  Object.entries(incoming).reduce(
    (merged, [filePath, fileData]) => ({
      ...merged,
      [filePath]: merged[filePath]
        ? mergeFileCoverage(merged[filePath], fileData)
        : fileData,
    }),
    accumulated,
  );

/**
 * Merge multiple coverage data objects (pure function)
 * Composes individual merge functions into a complete merging pipeline
 */
const mergeCoverage = (coverageList: readonly CoverageData[]): CoverageData =>
  coverageList.reduce(mergeSingleCoverage, {});

// ============================================================================
// I/O and Side Effects
// ============================================================================

/**
 * Load coverage data from file (with error handling)
 */
const loadCoverageData = (pathInfo: PathInfo): Result<CoverageResult, string> => {
  try {
    if (!fs.existsSync(pathInfo.path)) {
      return err(`Missing: ${pathInfo.path}`);
    }

    const content = fs.readFileSync(pathInfo.path, 'utf8');
    const data = JSON.parse(content) as CoverageData;

    return ok({ ...pathInfo, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(`Error loading ${pathInfo.path}: ${message}`);
  }
};

/**
 * Display warning message
 */
const displayWarning = (message: string): void => {
  console.warn(`Warning: ${message}`);
};

/**
 * Format layer stats line
 */
const formatLayerStats = (layer: TestLayer, stats: Stats): string =>
  `   ${
    layer.padEnd(12)
  }: ${stats.statements.pct}% stmt, ${stats.functions.pct}% func, ${stats.branches.pct}% branch, ${stats.lines.pct}% line`;

/**
 * Display formatted coverage report
 */
const displayReport = (
  layerStats: ReadonlyMap<string, Stats>,
  totalStats: Stats,
): void => {
  console.log('agla-error-core Integrated Coverage Analysis\n');
  console.log('='.repeat(80));

  // Display stats grouped by package and test layer
  PACKAGES.forEach((pkg) => {
    console.log(`\n[${pkg}]:`);
    TEST_LAYERS.forEach((layer) => {
      const key = `${pkg}-${layer}`;
      const stats = layerStats.get(key);

      if (stats) {
        console.log(formatLayerStats(layer, stats));
      } else {
        console.log(`   ${layer.padEnd(12)}: No data`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('**Integrated Coverage** (all packages and test layers combined):');
  console.log(
    `   Statements: ${totalStats.statements.covered}/${totalStats.statements.total} (${totalStats.statements.pct}%)`,
  );
  console.log(
    `   Functions:  ${totalStats.functions.covered}/${totalStats.functions.total} (${totalStats.functions.pct}%)`,
  );
  console.log(
    `   Branches:   ${totalStats.branches.covered}/${totalStats.branches.total} (${totalStats.branches.pct}%)`,
  );
  console.log(
    `   Lines:      ${totalStats.lines.covered}/${totalStats.lines.total} (${totalStats.lines.pct}%)`,
  );
  console.log('='.repeat(80));

  // Summary table
  console.log('\nSummary:');
  console.log(`    Statements: ${totalStats.statements.pct}%`);
  console.log(`    Functions:  ${totalStats.functions.pct}%`);
  console.log(`    Branches:   ${totalStats.branches.pct}%`);
  console.log(`    Lines:      ${totalStats.lines.pct}%`);
};

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main function (orchestrates the analysis)
 */
const main = (): void => {
  try {
    // Load all coverage files
    const loadResults = generateCoveragePaths().map(loadCoverageData);

    // Separate successes and failures
    const successes: CoverageResult[] = [];
    const failures: string[] = [];

    loadResults.forEach((result) => {
      if (result.success) {
        successes.push(result.value);
      } else {
        failures.push(result.error);
      }
    });

    // Display warnings for missing files
    failures.forEach(displayWarning);

    // Check if we have any data
    if (successes.length === 0) {
      console.error('No coverage files found');
      process.exit(1);
    }

    // Calculate stats per test layer
    const layerStats = new Map<string, Stats>();
    successes.forEach((result) => {
      const key = `${result.package}-${result.layer}`;
      const stats = calculateStats(result.data);
      layerStats.set(key, stats);
    });

    // Calculate integrated coverage across all layers
    const allCoverageData = successes.map((result) => result.data);
    const mergedCoverage = mergeCoverage(allCoverageData);
    const totalStats = calculateStats(mergedCoverage);

    // Display the report
    displayReport(layerStats, totalStats);

    console.log('\nCoverage analysis completed');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error('Coverage analysis error:', message);
    if (stack) {
      console.error(stack);
    }
    process.exit(1);
  }
};

// Run the analysis
main();
