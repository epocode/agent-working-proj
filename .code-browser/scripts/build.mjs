import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const out = resolve(root, 'lib')
mkdirSync(out, { recursive: true })

/** Resolve `?raw` imports to a default-exported string. */
const raw = {
  name: 'raw',
  setup(b) {
    b.onResolve({ filter: /\?raw$/ }, args => ({
      path: resolve(args.resolveDir, args.path.slice(0, -4)),
      namespace: 'raw',
    }))
    b.onLoad({ filter: /.*/, namespace: 'raw' }, args => ({
      contents: `export default ${JSON.stringify(readFileSync(args.path, 'utf8'))}`,
      loader: 'js',
    }))
  },
}

const client = await build({
  entryPoints: [resolve(root, 'src/client/index.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-client-store',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-primitives',
    '@deepseek-ai/dsh-client-ui-dockkit',
    '@tanstack/react-virtual',
    'zod',
  ],
  plugins: [raw],
  outfile: resolve(out, 'client.js'),
  banner: {
    js: 'window.__ModuleLoader__.load({ id: "dsh-code-browser", factory: (require) => { var module = { exports: {} }; var exports = module.exports;',
  },
  footer: { js: 'return module.exports; } });' },
  logLevel: 'warning',
})
if (client.errors.length > 0) process.exit(1)

writeFileSync(resolve(out, 'index.js'), `/** Host half: this bundle only carries the browser tab; the client does every read over the workspaceFiles Remote. */
export const name = 'dsh-code-browser'
export const inject = []
export function apply() {}
`)
console.log('built lib/client.js and lib/index.js')
