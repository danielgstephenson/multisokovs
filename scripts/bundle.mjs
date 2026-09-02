import * as esbuild from 'esbuild'

await esbuild.build({
  platform: 'browser',
  entryPoints: ['web/index.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2023',
  outfile: 'public/index.js',
  sourcemap: true,
})
