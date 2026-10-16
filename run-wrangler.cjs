const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const bundledNode = path.join(
  process.env.USERPROFILE || '',
  '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
);
const nodeMajor = Number(process.versions.node.split('.')[0]);
const nodeExecutable = nodeMajor >= 22 ? process.execPath : bundledNode;

if (!existsSync(nodeExecutable)) {
  console.error('Для запуска проекта нужен Node.js 22 или новее.');
  process.exit(1);
}

const child = spawn(nodeExecutable, [
  path.join(__dirname, 'node_modules/wrangler/bin/wrangler.js'),
  ...process.argv.slice(2),
], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_USE_SYSTEM_CA: '1',
    WRANGLER_SEND_METRICS: 'false',
  },
});

child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
