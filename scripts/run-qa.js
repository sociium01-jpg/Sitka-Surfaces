const { spawnSync } = require('child_process');
const path = require('path');

console.log('=== Starting Sitka Surfaces QA Check ===');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const projectDir = path.resolve(__dirname, '..');

// 1. Run ESLint
console.log('\n[1/2] Running ESLint...');
const eslint = spawnSync(npxCmd, ['eslint'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectDir
});

// 2. Run TypeScript Checks
console.log('\n[2/2] Running TypeScript compiler checks...');
const tsc = spawnSync(npxCmd, ['tsc', '--noEmit'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectDir
});

console.log('\n=== QA Run Summary ===');
const eslintPassed = eslint.status === 0;
const tscPassed = tsc.status === 0;

console.log(`ESLint:       ${eslintPassed ? 'PASS' : 'FAIL'}`);
console.log(`TypeScript:   ${tscPassed ? 'PASS' : 'FAIL'}`);

if (eslintPassed && tscPassed) {
  console.log('\nVerdict: SUCCESS - All checks passed cleanly.');
  process.exit(0);
} else {
  console.error('\nVerdict: FAILURE - One or more QA checks failed.');
  process.exit(1);
}
