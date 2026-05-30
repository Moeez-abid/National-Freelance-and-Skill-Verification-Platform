const { spawn } = require('node:child_process');
const path = require('node:path');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const root = path.resolve(__dirname, '..');

function run(name, args, cwd) {
  const child = spawn(npm, args, {
    cwd: path.join(root, cwd),
    shell: process.platform === 'win32',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code && !shuttingDown) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
}

let shuttingDown = false;
const children = [
  run('backend', ['run', 'dev'], 'backend'),
  run('frontend', ['run', 'dev'], 'frontend'),
];

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
