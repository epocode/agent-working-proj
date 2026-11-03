/** Read-only helpers over the workspaceFiles Remote and workspace path conventions. */
import type { CodeBrowserKey } from './locales'

export interface DirEntry {
  readonly name: string
  readonly type: 'file' | 'directory' | 'other'
  readonly size?: number
}

export interface DirLevel {
  readonly entries: readonly DirEntry[]
  readonly truncated: boolean
}

export interface FileText {
  readonly text: string
  readonly lines: number
  readonly eof: boolean
  readonly truncated: boolean
  readonly bytes?: number
  readonly version?: string
}

export type RemoteFailure = { readonly code: string; readonly message: string }
export type Result<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: RemoteFailure }

/** Common directories whose contents rarely help a first read of a project. */
const IGNORED = new Set([
  'node_modules', '.git', '.hg', '.svn', '.codex-home', '.next', '.nuxt', '.svelte-kit',
  'dist', 'build', 'out', 'target', 'coverage', '.cache', '.parcel-cache', '.turbo',
  '__pycache__', '.venv', 'venv', '.tox', '.mypy_cache', '.pytest_cache', '.tmp',
  '.DS_Store', '.idea', '.vscode-test', '.pnpm-store', 'vendor',
])

/** Whether a tree row is hidden while the reader keeps the common-ignore filter on. */
export function isIgnoredName(name: string): boolean {
  return IGNORED.has(name)
}

/** A human language id for the shared CodeBlock component. */
const LANGUAGES: Record<string, string> = {
  ts: 'typescript', mts: 'typescript', cts: 'typescript',
  tsx: 'tsx', js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'jsx',
  json: 'json', jsonc: 'jsonc', json5: 'json5',
  md: 'markdown', mdx: 'mdx', markdown: 'markdown',
  py: 'python', pyw: 'python',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'fish',
  ps1: 'powershell', psm1: 'powershell',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less',
  html: 'html', htm: 'html', xml: 'xml', svg: 'xml',
  vue: 'vue', svelte: 'svelte', astro: 'astro',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini',
  go: 'go', rs: 'rust', java: 'java', kt: 'kotlin', kts: 'kotlin',
  c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  cs: 'csharp', fs: 'fsharp', vb: 'vb',
  php: 'php', rb: 'ruby', swift: 'swift', scala: 'scala', lua: 'lua',
  r: 'r', pl: 'perl', pm: 'perl',
  sql: 'sql', graphql: 'graphql', gql: 'graphql',
  proto: 'proto', prisma: 'prisma', dockerfile: 'dockerfile',
  diff: 'diff', patch: 'diff', m: 'objective-c', mm: 'objective-cpp',
  dart: 'dart', ex: 'elixir', exs: 'elixir', erl: 'erlang', hs: 'haskell',
  clj: 'clojure', cljs: 'clojure', groovy: 'groovy', gradle: 'groovy',
  txt: 'text', log: 'text', env: 'bash', gitignore: 'text', editorconfig: 'ini',
}

/** Map a file name to the syntax id understood by the shared CodeBlock. */
export function languageFor(name: string | undefined): string {
  if (!name) return 'text'
  const base = name.toLowerCase()
  if (base === 'dockerfile' || base.startsWith('dockerfile.')) return 'dockerfile'
  if (base === 'makefile' || base === 'gnumakefile') return 'makefile'
  if (base === 'cmakelists.txt') return 'cmake'
  if (base === '.gitignore' || base === '.npmignore' || base === '.dockerignore') return 'text'
  if (base === 'package.json' || base === 'tsconfig.json' || base === 'composer.json') return 'json'
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.') + 1) : ''
  return LANGUAGES[ext] ?? 'text'
}

/** Suffixes that are not useful as text and are better handed to the built-in preview. */
const BINARY = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'icns', 'avif', 'tif', 'tiff',
  'pdf', 'zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp3', 'wav', 'ogg', 'flac', 'm4a', 'mp4', 'mov', 'avi', 'mkv', 'webm',
  'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'numbers', 'pages', 'key',
  'wasm', 'bin', 'exe', 'dll', 'so', 'dylib', 'class', 'jar', 'pyc',
  'sqlite', 'db', 'lock',
])

/** Whether the extension is certainly binary. Unknown files still try a text read. */
export function isBinaryName(name: string): boolean {
  const base = name.toLowerCase()
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.') + 1) : ''
  return BINARY.has(ext)
}

/** Normalize backslashes for display and joins. */
export function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

/** Whether a path is absolute on POSIX or Windows. */
export function isAbsolutePath(value: string): boolean {
  return value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value) || value.startsWith('\\\\')
}

/** Join a workspace-relative candidate onto the absolute root. */
export function joinPath(root: string, value: string): string {
  const child = normalizePath(value)
  if (isAbsolutePath(child)) return child
  const clean = child.replace(/^(?:\.\/)+/, '')
  const base = root.replace(/[/\\]+$/, '')
  return clean === '' ? base : `${base}/${clean}`
}

/** Render a path relative to the workspace root, falling back to the absolute path. */
export function relativeToRoot(root: string, value: string | undefined): string {
  if (!value) return ''
  const normalized = normalizePath(value)
  const base = normalizePath(root).replace(/\/+$/, '')
  if (base !== '' && normalized === base) return ''
  if (base !== '' && normalized.startsWith(`${base}/`)) return normalized.slice(base.length + 1)
  return normalized
}

/** The final segment of a path. */
export function fileNameOf(value: string | undefined): string {
  if (!value) return ''
  const normalized = normalizePath(value).replace(/\/+$/, '')
  const index = normalized.lastIndexOf('/')
  return index < 0 ? normalized : normalized.slice(index + 1)
}

/** The parent directory of a path, or the root itself. */
export function dirNameOf(value: string): string {
  const normalized = normalizePath(value).replace(/\/+$/, '')
  const index = normalized.lastIndexOf('/')
  return index <= 0 ? normalized.slice(0, index + 1) || '/' : normalized.slice(0, index)
}

/** Sort entries the way a reader scans a tree: directories first, then natural name order. */
export function orderEntries(entries: readonly DirEntry[]): DirEntry[] {
  return [...entries].sort((a, b) => {
    const group = (entry: DirEntry) => entry.type === 'directory' ? 0 : entry.type === 'file' ? 1 : 2
    const byGroup = group(a) - group(b)
    if (byGroup !== 0) return byGroup
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })
}

function failureOf(error: unknown): RemoteFailure {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return { code: String((error as { code: unknown }).code), message: String((error as { message: unknown }).message) }
  }
  return { code: 'gateway/internal', message: error instanceof Error ? error.message : String(error) }
}

/** List one workspace directory. A Remote failure is returned, never thrown. */
export async function listDirectory(
  remote: any, sessionId: string, path: string, signal: AbortSignal,
): Promise<Result<DirLevel>> {
  try {
    const result = await remote.workspaceFiles.list(sessionId, path, signal)
    if (!result?.ok) return { ok: false, error: failureOf(result?.error) }
    return { ok: true, value: { entries: result.value.entries ?? [], truncated: Boolean(result.value.truncated) } }
  } catch (error) {
    return { ok: false, error: failureOf(error) }
  }
}

/** The largest number of lines this tab keeps in memory for one file. */
export const MAX_FILE_LINES = 5000
const PAGE_LINES = 500

/** Read a text file page by page until EOF or the local line cap. */
export async function readTextFile(
  remote: any, sessionId: string, path: string, signal: AbortSignal,
): Promise<Result<FileText>> {
  let offset = 1
  let text = ''
  let lines = 0
  let bytes: number | undefined
  let version: string | undefined
  let truncated = false
  try {
    for (;;) {
      if (signal.aborted) return { ok: false, error: { code: 'aborted', message: 'aborted' } }
      const result = await remote.workspaceFiles.read(sessionId, path, { offset, limit: PAGE_LINES }, signal)
      if (!result?.ok) {
        // Keep the readable prefix when a later page fails.
        if (text !== '') return { ok: true, value: { text, lines, eof: false, truncated: true, bytes, version } }
        return { ok: false, error: failureOf(result?.error) }
      }
      const page = result.value
      bytes = page.bytes ?? bytes
      version = page.version ?? version
      if (page.lines === 0) return { ok: true, value: { text, lines, eof: true, truncated, bytes, version } }
      if (offset > 1 && text !== '') text += '\n'
      text += page.text
      lines += page.lines
      offset += page.lines
      if (page.eof) return { ok: true, value: { text, lines, eof: true, truncated, bytes, version } }
      if (lines >= MAX_FILE_LINES) return { ok: true, value: { text, lines, eof: false, truncated: true, bytes, version } }
      truncated = true
    }
  } catch (error) {
    return { ok: false, error: failureOf(error) }
  }
}

/** Map a Remote failure to a sentence a reader can act on. */
export function failureText(code: string | undefined, message: string | undefined, t: (key: CodeBrowserKey) => string): string {
  switch (code) {
    case 'workspace-file/not-found': return t('notFound')
    case 'workspace-file/not-text': return t('notText')
    case 'workspace-file/outside-workspace': return t('outside')
    case 'workspace-file/too-large': return t('tooLarge')
    default: return message ? `${t('readError')}: ${message}` : t('readError')
  }
}

/** Component-encode one id or path segment, keeping `:` for Windows drive letters. */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%3A/gi, ':')
}

/** Build the built-in preview's Session-scoped file address. */
export function fileAddressFor(sessionId: string, cwd: string | undefined, path: string): string {
  const normalized = normalizePath(path)
  const prefixed = normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) || normalized.startsWith('//')
  const root = cwd === undefined ? '' : normalizePath(cwd).replace(/\/+$/, '')
  let relative = prefixed ? normalized : normalized.replace(/^(?:\.\/)+/, '')
  if (prefixed && root !== '') {
    if (normalized === root) relative = ''
    else if (normalized.startsWith(`${root}/`)) relative = normalized.slice(root.length + 1)
  }
  const encoded = relative.split('/').map(encodeSegment).join('/')
  return `dsh-resource://file/session/${encodeSegment(sessionId)}/${encoded}`
}
