const { execSync } = require('child_process');
try {
  console.log('Running npm install...');
  const out = execSync('npm install', { stdio: 'pipe' });
  console.log('SUCCESS');
  console.log(out.toString());
} catch (e) {
  console.log('FAILED');
  console.log(e.stdout ? e.stdout.toString() : '');
  console.log(e.stderr ? e.stderr.toString() : '');
}
