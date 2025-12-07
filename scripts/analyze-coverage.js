#!/usr/bin/env node
// scripts/analyze-coverage.js
// Analyze and merge coverage reports from multiple test layers using functional programming

import fs from 'fs';
import path from 'path';

// Define packages and test layer names
const PACKAGES = ['agla-error-core'];
const TEST_LAYERS = ['unit', 'functional', 'integration', 'e2e', 'runtime'];

// Functional programming utilities
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
const map = (fn) => (array) => array.map(fn);
const filter = (predicate) => (array) => array.filter(predicate);
const reduce = (fn, initial) => (array) => array.reduce(fn, initial);
const flatMap = (fn) => (array) => array.flatMap(fn);

// Generate paths for all coverage files across packages and test layers
const generateCoveragePaths = () =>
  pipe(
    () => PACKAGES,
    flatMap((pkg) =>
      TEST_LAYERS.map((layer) => ({
        package: pkg,
        layer,
        path: `packages/@aglabo/${pkg}/coverage/${layer}/coverage-final.json`,
      }))
    ),
  )();

// Check if coverage file exists and load its data
const loadCoverageData = (pathInfo) => {
  try {
    if (!fs.existsSync(pathInfo.path)) {
      console.warn(`⚠️  Missing: ${pathInfo.path}`);
      return null;
    }

    const data = JSON.parse(fs.readFileSync(pathInfo.path, 'utf8'));
    return { ...pathInfo, data };
  } catch (error) {
    console.error(`❌ Error loading ${pathInfo.path}:`, error.message);
    return null;
  }
};

// Calculate coverage statistics (pure function)
const calculateStats = (coverageData) => {
  const stats = Object.values(coverageData).reduce((acc, file) => {
    // Statements
    if (file.s) {
      const statements = Object.values(file.s);
      acc.statements.total += statements.length;
      acc.statements.covered += statements.filter((count) => count > 0).length;
    }

    // Functions
    if (file.f) {
      const functions = Object.values(file.f);
      acc.functions.total += functions.length;
      acc.functions.covered += functions.filter((count) => count > 0).length;
    }

    // Branches
    if (file.b) {
      Object.values(file.b).forEach((branchData) => {
        if (Array.isArray(branchData)) {
          acc.branches.total += branchData.length;
          acc.branches.covered += branchData.filter((count) => count > 0).length;
        }
      });
    }

    // Lines (estimate from statementMap for v8 format)
    if (file.l) {
      const lines = Object.entries(file.l);
      acc.lines.total += lines.length;
      acc.lines.covered += lines.filter(([, count]) => count > 0).length;
    } else if (file.statementMap && file.s) {
      // v8 format: extract line numbers from statementMap and match with execution counts
      const lineHits = new Map();
      Object.entries(file.statementMap).forEach(([stmtId, location]) => {
        if (location && location.start && typeof location.start.line === 'number') {
          const line = location.start.line;
          const count = file.s[stmtId] || 0;
          lineHits.set(line, Math.max(lineHits.get(line) || 0, count));
        }
      });

      acc.lines.total += lineHits.size;
      acc.lines.covered += Array.from(lineHits.values()).filter((count) => count > 0).length;
    }

    return acc;
  }, {
    statements: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
    lines: { total: 0, covered: 0 },
  });

  // Calculate percentage for each metric
  const addPercentage = (metric) => ({
    ...metric,
    pct: metric.total > 0 ? ((metric.covered / metric.total) * 100).toFixed(2) : '0.00',
  });

  return {
    statements: addPercentage(stats.statements),
    functions: addPercentage(stats.functions),
    branches: addPercentage(stats.branches),
    lines: addPercentage(stats.lines),
  };
};

// Merge multiple coverage objects (pure function)
const mergeCoverage = (coverageList) =>
  coverageList.reduce((merged, coverage) => {
    Object.entries(coverage).forEach(([filePath, fileData]) => {
      if (!merged[filePath]) {
        merged[filePath] = JSON.parse(JSON.stringify(fileData));
        return;
      }

      const existing = merged[filePath];

      // Statements
      if (fileData.s) {
        existing.s = existing.s || {};
        Object.entries(fileData.s).forEach(([key, value]) => {
          existing.s[key] = Math.max(existing.s[key] || 0, value || 0);
        });
      }

      // Functions
      if (fileData.f) {
        existing.f = existing.f || {};
        Object.entries(fileData.f).forEach(([key, value]) => {
          existing.f[key] = Math.max(existing.f[key] || 0, value || 0);
        });
      }

      // Branches
      if (fileData.b) {
        existing.b = existing.b || {};
        Object.entries(fileData.b).forEach(([key, branchArray]) => {
          if (!existing.b[key]) { existing.b[key] = []; }
          if (Array.isArray(branchArray)) {
            branchArray.forEach((value, index) => {
              existing.b[key][index] = Math.max(existing.b[key][index] || 0, value || 0);
            });
          }
        });
      }

      // Lines (v8 support: merge using statementMap reference)
      if (fileData.l) {
        existing.l = existing.l || {};
        Object.entries(fileData.l).forEach(([key, value]) => {
          existing.l[key] = Math.max(existing.l[key] || 0, value || 0);
        });
      } else if (fileData.statementMap) {
        // v8 format: preserve statementMap and statement data for line mapping
        existing.statementMap = existing.statementMap || {};
        Object.assign(existing.statementMap, fileData.statementMap);
      }
    });

    return merged;
  }, {});

// Display formatted coverage report
const displayReport = (layerStats, totalStats) => {
  console.log(' agla-error-core Integrated Coverage Analysis\n');
  console.log('='.repeat(80));

  // Display stats grouped by package and test layer
  PACKAGES.forEach((pkg) => {
    console.log(`\n ${pkg}:`);
    TEST_LAYERS.forEach((layer) => {
      const key = `${pkg}-${layer}`;
      const stats = layerStats.get(key);
      if (stats) {
        console.log(
          `   ${
            layer.padEnd(12)
          }: ${stats.statements.pct}% stmt, ${stats.functions.pct}% func, ${stats.branches.pct}% branch, ${stats.lines.pct}% line`,
        );
      } else {
        console.log(`   ${layer.padEnd(12)}: No data`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log(' **Integrated Coverage** (all packages and test layers combined):');
  console.log(
    `   Statements: ${totalStats.statements.covered}/${totalStats.statements.total} (${totalStats.statements.pct}%)`,
  );
  console.log(
    `   Functions:  ${totalStats.functions.covered}/${totalStats.functions.total} (${totalStats.functions.pct}%)`,
  );
  console.log(
    `   Branches:   ${totalStats.branches.covered}/${totalStats.branches.total} (${totalStats.branches.pct}%)`,
  );
  console.log(`   Lines:      ${totalStats.lines.covered}/${totalStats.lines.total} (${totalStats.lines.pct}%)`);
  console.log('='.repeat(80));

  // Summary table
  console.log('\n Summary:');
  console.log(`    Statements: ${totalStats.statements.pct}%`);
  console.log(`    Functions:  ${totalStats.functions.pct}%`);
  console.log(`    Branches:   ${totalStats.branches.pct}%`);
  console.log(`    Lines:      ${totalStats.lines.pct}%`);
};

// Main entry point and orchestration
const main = () => {
  try {
    const results = pipe(
      generateCoveragePaths,
      map(loadCoverageData),
      filter((result) => result !== null),
    )();

    if (results.length === 0) {
      console.error('❌ No coverage files found');
      process.exit(1);
    }

    // Calculate stats per test layer
    const layerStats = new Map();
    results.forEach((result) => {
      const key = `${result.package}-${result.layer}`;
      const stats = calculateStats(result.data);
      layerStats.set(key, stats);
    });

    // Calculate integrated coverage across all layers
    const allCoverageData = results.map((result) => result.data);
    const mergedCoverage = mergeCoverage(allCoverageData);
    const totalStats = calculateStats(mergedCoverage);

    // Display the report
    displayReport(layerStats, totalStats);

    console.log('\n✅ Coverage analysis completed');
  } catch (error) {
    console.error('❌ Coverage analysis error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the analysis
main();
