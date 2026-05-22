const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/host/extensao.ts'],
    outfile: 'dist/host/extensao.js',
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    sourcemap: false,
    external: ['vscode'],
    logLevel: 'info',
    minify: false,
  })
  .catch(() => process.exit(1));
