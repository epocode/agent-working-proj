/** The read-only code browsing surface: project tree, quick open, source view, and outline. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CodeBrowserKey } from './locales'
import { format } from './locales'
import {
  dirNameOf, failureText, fileAddressFor, fileNameOf, isBinaryName, isIgnoredName, joinPath,
  languageFor, listDirectory, orderEntries, readTextFile, relativeToRoot,
  type DirEntry, type DirLevel, type FileText,
} from './files'
import { extractSymbols, type CodeSymbol } from './symbols'

/* The platform module is provided by the Web shell; keep its surface implicit so a version change is a runtime, not a build, concern. */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'

const CodeBlockView: any = (primitives as any).CodeBlock
const FileTypeIcon: any = (primitives as any).FileTypeIcon
const classifyFileType: any = (primitives as any).classifyFileType

type Translate = (key: CodeBrowserKey) => string

interface CodeBrowserProps {
  readonly ctx: any
  readonly tr: Translate
  readonly sessionId: string
  readonly useTabInfo: () => any
  readonly useSessions: (selector: (sessions: any) => any) => any
}

type LevelState =
  | { kind: 'loading' }
  | { kind: 'ready'; level: DirLevel }
  | { kind: 'error'; code?: string; message: string }

type FileState =
  | { kind: 'idle' }
  | { kind: 'loading'; path: string }
  | { kind: 'ready'; path: string; file: FileText }
  | { kind: 'binary'; path: string }
  | { kind: 'error'; path: string; code?: string; message: string }

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; items: readonly { path: string; kind: 'file' | 'directory'; name?: string }[] }
  | { kind: 'error'; message: string }

interface SelectionRange {
  readonly start: number
  readonly end: number
}

const STORAGE = 'dsh-code-browser.v1'
const MAX_QUOTE_LINES = 220

const icons = {
  tree: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 2.5v11M3 5h4M3 8h4M3 11h4M7 5v6" />
      <rect x="7" y="3.5" width="6" height="3" rx="0.8" />
      <rect x="7" y="9.5" width="6" height="3" rx="0.8" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13.2 7A5.2 5.2 0 1 0 12 11.2" />
      <path d="M13.2 2.8V7H9" />
    </svg>
  ),
  outline: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden>
      <path d="M3 3.5h10M3 6.5h6M3 9.5h8M3 12.5h5" />
      <circle cx="12.8" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.3" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  wrap: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 4h11M2.5 8h8.5a2 2 0 1 1 0 4H8" />
      <path d="M9.8 10.5 8 12l1.8 1.5" />
      <path d="M2.5 12h3" />
    </svg>
  ),
  nowrap: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 4h11M2.5 8h11M2.5 12h6" />
      <path d="M9.8 12h1.7" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5.2" y="5.2" width="8" height="8" rx="1.4" />
      <path d="M10.8 5.2V3.8A1.3 1.3 0 0 0 9.5 2.5h-5A1.3 1.3 0 0 0 3.2 3.8v5a1.3 1.3 0 0 0 1.3 1.3h1.4" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.2 3.5H3.8A1.3 1.3 0 0 0 2.5 4.8v2.4a1.3 1.3 0 0 0 1.3 1.3h1.5v1.2c0 .9-.5 1.5-1.4 1.9" />
      <path d="M13.5 3.5h-2.4a1.3 1.3 0 0 0-1.3 1.3v2.4a1.3 1.3 0 0 0 1.3 1.3h1.5v1.2c0 .9-.5 1.5-1.4 1.9" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <circle cx="7.2" cy="7.2" r="4.2" />
      <path d="m10.3 10.3 3 3" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.8 8s2.3-4.1 6.2-4.1S14.2 8 14.2 8s-2.3 4.1-6.2 4.1S1.8 8 1.8 8Z" />
      <circle cx="8" cy="8" r="1.8" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 2.3h5.2L12.5 5.6v8.1H4z" />
      <path d="M9.2 2.3v3.3h3.3" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.2 4.4c0-.6.5-1.1 1.1-1.1h2.6l1.2 1.3h4.6c.6 0 1.1.5 1.1 1.1v6.2c0 .6-.5 1.1-1.1 1.1H3.3c-.6 0-1.1-.5-1.1-1.1z" />
    </svg>
  ),
}

function fileIconKind(name: string): string {
  if (typeof classifyFileType !== 'function') return 'file'
  try {
    return classifyFileType(name) ?? 'file'
  } catch {
    return 'file'
  }
}

function FileGlyph({ name, size = 15 }: { name?: string; size?: number }) {
  if (typeof FileTypeIcon !== 'function') return icons.file
  return <FileTypeIcon kind={name === undefined ? 'folder' : fileIconKind(name)} size={size} aria-hidden />
}

function kindLetter(kind: string): string {
  switch (kind) {
    case 'class': return 'C'
    case 'function': return 'ƒ'
    case 'method': return 'm'
    case 'constant': return 'K'
    case 'type': return 'T'
    case 'impl': return 'I'
    case 'table': return 'D'
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return '#'
    default: return '•'
  }
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'class': return 'class'
    case 'function': return 'function'
    case 'method': return 'method'
    case 'constant': return 'const'
    case 'type': return 'type'
    case 'impl': return 'impl'
    case 'table': return 'table'
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'heading'
    default: return 'symbol'
  }
}

/** The visible line range of a browser selection inside the rendered code. */
function selectionRange(container: HTMLElement | null): SelectionRange | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null
  if (!container || !selection.anchorNode || !selection.focusNode) return null
  if (!container.contains(selection.anchorNode) || !container.contains(selection.focusNode)) return null
  const lines = Array.from(container.querySelectorAll('.line'))
  if (lines.length === 0) return null
  const lineOf = (node: Node | null): number => {
    let element: Element | null = node instanceof Element ? node : node?.parentElement ?? null
    while (element && element !== container) {
      if (element.classList.contains('line')) return lines.indexOf(element)
      element = element.parentElement
    }
    return -1
  }
  let a = lineOf(selection.anchorNode)
  let b = lineOf(selection.focusNode)
  if (a < 0 || b < 0) return null
  if (a > b) [a, b] = [b, a]
  return { start: a + 1, end: b + 1 }
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

export function CodeBrowser({ ctx, tr, sessionId, useTabInfo, useSessions }: CodeBrowserProps) {
  const { tab } = useTabInfo()
  const cwd = useSessions((sessions: any) => sessions.byId[sessionId]?.cwd)
  const root = typeof cwd === 'string' ? cwd : ''

  const [levels, setLevels] = useState<Record<string, LevelState>>({})
  const levelsRef = useRef(levels)
  levelsRef.current = levels
  const controllers = useRef(new Map<string, AbortController>())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const expandedRef = useRef(expanded)
  expandedRef.current = expanded
  const [currentFile, setCurrentFile] = useState<string | undefined>(undefined)
  const [fileState, setFileState] = useState<FileState>({ kind: 'idle' })
  const [fileNonce, setFileNonce] = useState(0)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchState>({ kind: 'idle' })
  const [showHidden, setShowHidden] = useState(false)
  const [wrap, setWrap] = useState(true)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [treeOpen, setTreeOpen] = useState(true)
  const [narrow, setNarrow] = useState(false)
  const [selection, setSelection] = useState<SelectionRange | null>(null)
  const [toast, setToast] = useState<string | undefined>(undefined)
  const [reloadNonce, setReloadNonce] = useState(0)
  const wasNarrow = useRef<boolean | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)
  const rootElement = useRef<HTMLDivElement>(null)
  const codeElement = useRef<HTMLDivElement>(null)
  const readController = useRef<AbortController | undefined>(undefined)
  const searchInput = useRef<HTMLInputElement>(null)
  const restored = useRef(false)
  const storageKey = `${STORAGE}.${sessionId}`

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(undefined), 2200)
  }, [])

  /* ── directory loading ─────────────────────────────────────────────────── */

  const loadDir = useCallback(async (path: string) => {
    const previous = controllers.current.get(path)
    previous?.abort()
    const controller = new AbortController()
    controllers.current.set(path, controller)
    setLevels(state => ({ ...state, [path]: { kind: 'loading' } }))
    const result = await listDirectory(ctx.remote, sessionId, path, controller.signal)
    if (controllers.current.get(path) === controller) controllers.current.delete(path)
    if (controller.signal.aborted) return
    setLevels(state => {
      if (state[path]?.kind !== 'loading') return state
      if (result.ok) return { ...state, [path]: { kind: 'ready', level: result.value } }
      return { ...state, [path]: { kind: 'error', code: result.error.code, message: result.error.message } }
    })
  }, [ctx, sessionId])

  useEffect(() => {
    const signal = tab.signal as AbortSignal
    const stop = () => {
      for (const controller of controllers.current.values()) controller.abort()
      controllers.current.clear()
      readController.current?.abort()
    }
    if (signal.aborted) stop()
    signal.addEventListener('abort', stop, { once: true })
    return () => signal.removeEventListener('abort', stop)
  }, [tab.signal])

  useEffect(() => {
    if (!root) return
    setExpanded(new Set([root]))
    setCurrentFile(undefined)
    setFileState({ kind: 'idle' })
    setQuery('')
    setSearch({ kind: 'idle' })
    setSelection(null)
    restored.current = false
    for (const controller of controllers.current.values()) controller.abort()
    controllers.current.clear()
    setLevels({})
  }, [root, sessionId])

  useEffect(() => {
    if (!root) return
    const wanted = new Set([root, ...expanded])
    for (const path of wanted) {
      if (!path.startsWith(root)) continue
      if (levelsRef.current[path] === undefined && !controllers.current.has(path)) void loadDir(path)
    }
  }, [root, expanded, reloadNonce, loadDir])

  /* ── restore / remember the reader position ────────────────────────────── */

  useEffect(() => {
    if (!root || restored.current) return
    restored.current = true
    let saved: any
    try {
      saved = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
    } catch {
      saved = null
    }
    if (!saved || typeof saved !== 'object') return
    if (typeof saved.wrap === 'boolean') setWrap(saved.wrap)
    if (typeof saved.showHidden === 'boolean') setShowHidden(saved.showHidden)
    if (Array.isArray(saved.expanded)) {
      const next = new Set([root, ...saved.expanded.filter((path: unknown): path is string => typeof path === 'string' && path.startsWith(root))])
      setExpanded(next)
    }
    if (typeof saved.file === 'string' && saved.file.startsWith(root)) setCurrentFile(saved.file)
  }, [root, storageKey])

  useEffect(() => {
    if (!root) return
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({
          file: currentFile,
          expanded: [...expanded],
          wrap,
          showHidden,
        }))
      } catch {
        /* storage is optional */
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [root, storageKey, currentFile, expanded, wrap, showHidden])

  /* ── file reading ──────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!currentFile) {
      setFileState({ kind: 'idle' })
      return
    }
    readController.current?.abort()
    const controller = new AbortController()
    readController.current = controller
    if (isBinaryName(currentFile)) {
      setFileState({ kind: 'binary', path: currentFile })
      return
    }
    setFileState({ kind: 'loading', path: currentFile })
    void readTextFile(ctx.remote, sessionId, currentFile, controller.signal).then(result => {
      if (controller.signal.aborted) return
      if (result.ok) setFileState({ kind: 'ready', path: currentFile, file: result.value })
      else setFileState({ kind: 'error', path: currentFile, code: result.error.code, message: result.error.message })
    })
    return () => controller.abort()
  }, [ctx, sessionId, currentFile, fileNonce])

  useEffect(() => {
    if (!currentFile || !root) return
    const relative = relativeToRoot(root, currentFile)
    if (!relative) return
    const parts = relative.split('/').slice(0, -1)
    if (parts.length === 0) return
    let absolute = root
    const ancestors: string[] = []
    for (const part of parts) {
      absolute = joinPath(absolute, part)
      ancestors.push(absolute)
    }
    setExpanded(previous => {
      let changed = false
      const next = new Set(previous)
      for (const path of ancestors) if (!next.has(path)) { next.add(path); changed = true }
      return changed ? next : previous
    })
    for (const path of ancestors) {
      if (levelsRef.current[path] === undefined && !controllers.current.has(path)) void loadDir(path)
    }
  }, [currentFile, root, loadDir])

  /* ── quick open ────────────────────────────────────────────────────────── */

  useEffect(() => {
    const text = query.trim()
    if (text === '') {
      setSearch({ kind: 'idle' })
      return
    }
    const controller = new AbortController()
    setSearch({ kind: 'loading' })
    const timer = window.setTimeout(() => {
      void ctx.remote.fileReferences.list(sessionId, text, controller.signal).then((result: any) => {
        if (controller.signal.aborted) return
        if (result?.ok) {
          const items = Array.isArray(result.value) ? result.value : result.value?.items ?? []
          setSearch({ kind: 'ready', items })
        } else {
          setSearch({ kind: 'error', message: result?.error?.message ?? '' })
        }
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setSearch({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    }, 160)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [ctx, sessionId, query])

  /* ── width, selection, and shortcuts ───────────────────────────────────── */

  useEffect(() => {
    const element = rootElement.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0
      const next = width > 0 && width < 560
      setNarrow(next)
      if (wasNarrow.current !== next) {
        wasNarrow.current = next
        setTreeOpen(!next || currentFile === undefined)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [currentFile])

  useEffect(() => {
    const update = () => setSelection(selectionRange(codeElement.current))
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])

  useEffect(() => {
    if (!outlineOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOutlineOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [outlineOpen])

  const symbols = useMemo<CodeSymbol[]>(() => {
    if (fileState.kind !== 'ready') return []
    return extractSymbols(fileState.file.text, fileState.path)
  }, [fileState])

  /* ── derived views ─────────────────────────────────────────────────────── */

  const openFile = useCallback((path: string) => {
    setCurrentFile(path)
    setOutlineOpen(false)
    if (narrow) setTreeOpen(false)
  }, [narrow])

  const toggleDir = useCallback((path: string) => {
    setExpanded(previous => {
      const next = new Set(previous)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
        if (levelsRef.current[path] === undefined && !controllers.current.has(path)) void loadDir(path)
      }
      return next
    })
  }, [loadDir])

  const refresh = useCallback(() => {
    for (const controller of controllers.current.values()) controller.abort()
    controllers.current.clear()
    setLevels({})
    setFileNonce(nonce => nonce + 1)
    setReloadNonce(nonce => nonce + 1)
  }, [])

  useEffect(() => tab.actions.bindCommands({ refresh }), [tab.actions, refresh])

  const jumpToLine = useCallback((line: number) => {
    setOutlineOpen(false)
    const container = codeElement.current
    if (!container) return
    const rendered = Array.from(container.querySelectorAll('.line')) as HTMLElement[]
    const target = rendered[line - 1]
    if (target) {
      const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
      container.scrollTo({ top: Math.max(0, top - container.clientHeight / 2), behavior: 'smooth' })
      target.classList.add('dcb-line-flash')
      window.setTimeout(() => target.classList.remove('dcb-line-flash'), 1600)
      return
    }
    const computed = window.getComputedStyle(container)
    const lineHeight = Number.parseFloat(computed.lineHeight) || 19
    container.scrollTo({ top: Math.max(0, (line - 1) * lineHeight - 80), behavior: 'smooth' })
  }, [])

  const quote = useCallback(() => {
    if (fileState.kind !== 'ready') return
    const source = fileState.file.text
    const all = source.split('\n')
    let start = 1
    let end = all.length
    let body = source
    if (selection && selection.start >= 1 && selection.end <= all.length) {
      start = selection.start
      end = selection.end
      body = all.slice(start - 1, end).join('\n')
    } else if (all.length > MAX_QUOTE_LINES) {
      end = MAX_QUOTE_LINES
      body = all.slice(0, MAX_QUOTE_LINES).join('\n')
    }
    const relative = relativeToRoot(root, currentFile) || fileNameOf(currentFile)
    const lang = languageFor(currentFile)
    const whole = start === 1 && end === all.length
    const heading = whole
      ? `请解释 @${relative} 这个文件：`
      : `请解释 @${relative} 中第 ${start}-${end} 行：`
    const snippet = `${heading}\n\n\`\`\`${lang}\n${body}\n\`\`\`\n`
    const scope = ctx.sessions?.scope?.(sessionId)
    const input = scope && ctx.conversation ? ctx.conversation.input.for(scope) : undefined
    if (input) {
      let previous = ''
      try { previous = input.state?.getSnapshot?.()?.draft ?? '' } catch { previous = '' }
      const next = previous.trim() === '' ? snippet : `${previous.trimEnd()}\n\n${snippet}`
      try {
        input.setDraft(next)
        input.focus()
        showToast(tr('quoted'))
        return
      } catch {
        /* fall through to the clipboard */
      }
    }
    void copyText(snippet).then(ok => showToast(ok ? tr('quoteCopied') : tr('readError')))
  }, [fileState, selection, root, currentFile, ctx, sessionId, showToast, tr])

  const copyCode = useCallback(() => {
    if (fileState.kind !== 'ready') return
    void copyText(fileState.file.text).then(ok => { if (ok) showToast(tr('copied')) })
  }, [fileState, showToast, tr])

  const copyPath = useCallback((value: string) => {
    void copyText(value).then(ok => { if (ok) showToast(tr('pathCopied')) })
  }, [showToast, tr])

  const openPreview = useCallback(() => {
    if (!currentFile) return
    try {
      tab.actions.openResource(fileAddressFor(sessionId, root, currentFile))
      if (narrow) setTreeOpen(false)
    } catch (error) {
      showToast(`${tr('openFailed')}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [tab.actions, sessionId, root, currentFile, narrow, showToast, tr])

  const selectCandidate = useCallback((candidate: { path: string; kind: 'file' | 'directory' }) => {
    const absolute = joinPath(root, candidate.path)
    if (candidate.kind === 'directory') {
      setQuery('')
      setExpanded(previous => {
        const next = new Set(previous)
        next.add(absolute)
        return next
      })
      if (levelsRef.current[absolute] === undefined && !controllers.current.has(absolute)) void loadDir(absolute)
      return
    }
    setQuery('')
    openFile(absolute)
  }, [root, openFile, loadDir])

  /* ── render helpers ────────────────────────────────────────────────────── */

  const rootLevel = levels[root]
  const rootEntries = rootLevel?.kind === 'ready' ? orderEntries(rootLevel.level.entries) : []
  const quickFiles = rootEntries.filter(entry => entry.type === 'file' && /^(readme(\.|$)|package\.json$|pyproject\.toml$|cargo\.toml$|go\.mod$|makefile$|dockerfile$|compose\.ya?ml$)/i.test(entry.name)).slice(0, 4)
  const quickDirs = rootEntries.filter(entry => entry.type === 'directory' && !isIgnoredName(entry.name) && /^(src|app|lib|packages|server|web|cmd|internal)$/i.test(entry.name)).slice(0, 1)

  const tree = (
    <aside className="dcb-tree" aria-label={tr('tree')}>
      <div className="dcb-tree-tools">
        <label className="dcb-search">
          <span className="dcb-search-icon">{icons.search}</span>
          <input
            ref={searchInput}
            value={query}
            spellCheck={false}
            autoComplete="off"
            placeholder={tr('searchPlaceholder')}
            aria-label={tr('searchFiles')}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Escape') setQuery('')
            }}
          />
          {query !== '' && (
            <button type="button" className="dcb-search-clear" onClick={() => { setQuery(''); searchInput.current?.focus() }} aria-label={tr('close')}>
              {icons.close}
            </button>
          )}
        </label>
        <button
          type="button"
          className={`dcb-icon${showHidden ? ' is-on' : ''}`}
          onClick={() => setShowHidden(value => !value)}
          title={showHidden ? tr('hideHidden') : tr('showHidden')}
          aria-label={showHidden ? tr('hideHidden') : tr('showHidden')}
          aria-pressed={showHidden}
        >
          {icons.eye}
        </button>
      </div>
      {!showHidden && (
        <div className="dcb-tree-note" title={tr('hiddenNotice')}>
          <span className="dcb-dot" />
          {tr('hiddenNotice')}
        </div>
      )}
      <div className="dcb-tree-scroll">
        {query.trim() !== '' ? (
          <SearchList state={search} tr={tr} onPick={selectCandidate} />
        ) : (
          <TreeLevel
            path={root} depth={0} levels={levels} expanded={expanded} currentFile={currentFile}
            showHidden={showHidden} tr={tr} onToggle={toggleDir} onOpen={openFile}
          />
        )}
      </div>
    </aside>
  )

  return (
    <div
      ref={rootElement}
      className={`dcb-root${narrow ? ' is-narrow' : ''}${treeOpen ? ' is-tree-open' : ''}`}
      data-code-browser=""
    >
      <header className="dcb-header">
        <button
          type="button"
          className={`dcb-icon${treeOpen ? ' is-on' : ''}`}
          onClick={() => setTreeOpen(value => !value)}
          title={treeOpen ? tr('hideTree') : tr('showTree')}
          aria-label={treeOpen ? tr('hideTree') : tr('showTree')}
          aria-expanded={treeOpen}
        >
          {icons.tree}
        </button>
        <button type="button" className="dcb-project" onClick={() => copyPath(root)} title={`${root}\n${tr('copyPath')}`}>
          <FileGlyph />
          <span className="dcb-project-name">{fileNameOf(root) || root}</span>
          {currentFile && (
            <>
              <span className="dcb-crumb-sep">/</span>
              <span className="dcb-file-name">{relativeToRoot(root, currentFile)}</span>
            </>
          )}
        </button>
        <div className="dcb-actions">
          {symbols.length > 0 && (
            <button
              type="button"
              className={`dcb-icon${outlineOpen ? ' is-on' : ''}`}
              onClick={() => setOutlineOpen(value => !value)}
              title={`${tr('outline')} (${symbols.length})`}
              aria-label={tr('outline')}
              aria-expanded={outlineOpen}
            >
              {icons.outline}
            </button>
          )}
          {fileState.kind === 'ready' && (
            <>
              <button
                type="button"
                className="dcb-icon"
                onClick={() => setWrap(value => !value)}
                title={wrap ? tr('nowrap') : tr('wrap')}
                aria-label={wrap ? tr('nowrap') : tr('wrap')}
                aria-pressed={wrap}
              >
                {wrap ? icons.wrap : icons.nowrap}
              </button>
              <button type="button" className="dcb-icon" onClick={copyCode} title={tr('copy')} aria-label={tr('copy')}>
                {icons.copy}
              </button>
              <button type="button" className="dcb-quote" onClick={quote} title={tr('quote')} aria-label={tr('quote')}>
                {icons.quote}
                <span className="dcb-btn-label">{tr('quote')}</span>
              </button>
            </>
          )}
          <button type="button" className="dcb-icon" onClick={refresh} title={tr('refresh')} aria-label={tr('refresh')}>
            {icons.refresh}
          </button>
        </div>
      </header>

      <div className="dcb-body">
        {treeOpen && tree}
        {narrow && treeOpen && <div className="dcb-drawer-backdrop" onClick={() => setTreeOpen(false)} />}
        <main className="dcb-main">
          {fileState.kind === 'idle' && (
            <div className="dcb-welcome">
              <div className="dcb-welcome-mark"><FileGlyph size={38} /></div>
              <h2>{tr('welcomeTitle')}</h2>
              <p className="dcb-welcome-lede">{tr('welcomeBody')}</p>
              <button type="button" className="dcb-project-card" onClick={() => copyPath(root)} title={tr('copyPath')}>
                <span className="dcb-project-card-label">{tr('project')}</span>
                <span className="dcb-project-path">{root}</span>
                <span className="dcb-project-card-hint">{tr('welcomeHint')}</span>
              </button>
              {(quickFiles.length > 0 || quickDirs.length > 0) && (
                <section className="dcb-quick">
                  <h3>{tr('startHere')}</h3>
                  <div className="dcb-quick-grid">
                    {quickDirs.map(entry => {
                      const path = joinPath(root, entry.name)
                      return (
                        <button key={path} type="button" className="dcb-quick-card" onClick={() => { setExpanded(previous => new Set(previous).add(path)); if (!levelsRef.current[path]) void loadDir(path); if (narrow) setTreeOpen(true) }}>
                          <span className="dcb-quick-icon">{icons.folder}</span>
                          <span className="dcb-quick-text">
                            <strong>{entry.name}</strong>
                            <small>{tr('sourceDir')}</small>
                          </span>
                        </button>
                      )
                    })}
                    {quickFiles.map(entry => {
                      const path = joinPath(root, entry.name)
                      const label = /^readme/i.test(entry.name) ? tr('readme') : entry.name === 'package.json' ? tr('packageJson') : entry.name
                      return (
                        <button key={path} type="button" className="dcb-quick-card" onClick={() => openFile(path)}>
                          <span className="dcb-quick-icon"><FileGlyph name={entry.name} /></span>
                          <span className="dcb-quick-text">
                            <strong>{entry.name}</strong>
                            <small>{label}</small>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}
              <p className="dcb-hint">{tr('shortcutHint')}</p>
              {narrow && (
                <button type="button" className="dcb-primary-button" onClick={() => setTreeOpen(true)}>
                  {icons.tree}
                  <span>{tr('showTree')}</span>
                </button>
              )}
            </div>
          )}

          {fileState.kind === 'loading' && (
            <div className="dcb-state">
              <span className="dcb-spinner" />
              <span>{tr('loading')}</span>
            </div>
          )}

          {fileState.kind === 'binary' && (
            <div className="dcb-state dcb-state-empty">
              <div className="dcb-state-icon"><FileGlyph name={fileNameOf(fileState.path)} size={34} /></div>
              <p>{tr('binary')}</p>
              <button type="button" className="dcb-primary-button" onClick={openPreview}>{tr('openPreview')}</button>
            </div>
          )}

          {fileState.kind === 'error' && (
            <div className="dcb-state dcb-state-empty">
              <div className="dcb-state-icon"><FileGlyph name={fileNameOf(fileState.path)} size={34} /></div>
              <p>{failureText(fileState.code, fileState.message, tr)}</p>
              <div className="dcb-state-actions">
                <button type="button" className="dcb-primary-button" onClick={() => setFileNonce(nonce => nonce + 1)}>{tr('retry')}</button>
                <button type="button" className="dcb-ghost-button" onClick={openPreview}>{tr('openPreview')}</button>
              </div>
            </div>
          )}

          {fileState.kind === 'ready' && (
            <>
              <div className="dcb-code-scroll" ref={codeElement}>
                {typeof CodeBlockView === 'function'
                  ? <CodeBlockView code={fileState.file.text} lang={languageFor(fileState.path)} lineNumbers showHeader={false} wrap={wrap} className="dcb-codeblock" />
                  : <pre className="dcb-plain-code">{fileState.file.text}</pre>}
              </div>
              <div className="dcb-status">
                <span className="dcb-status-lang">{languageFor(fileState.path)}</span>
                <span>{format(tr('lineCount'), { count: fileState.file.lines })}</span>
                {fileState.file.truncated && <span className="dcb-status-warn" title={tr('tooLarge')}>{tr('truncated')}</span>}
                <span className="dcb-status-path" title={fileState.path}>{relativeToRoot(root, fileState.path) || fileNameOf(fileState.path)}</span>
                <button type="button" className="dcb-status-action" onClick={openPreview}>{tr('openPreview')}</button>
              </div>
            </>
          )}

          {outlineOpen && symbols.length > 0 && (
            <>
              <div className="dcb-popover-backdrop" onClick={() => setOutlineOpen(false)} />
              <div className="dcb-outline" role="dialog" aria-label={tr('outline')}>
                <div className="dcb-outline-head">
                  <span>{tr('outline')}</span>
                  <span className="dcb-outline-count">{symbols.length}</span>
                  <button type="button" className="dcb-icon" onClick={() => setOutlineOpen(false)} aria-label={tr('close')}>{icons.close}</button>
                </div>
                <div className="dcb-outline-list">
                  {symbols.map(symbol => (
                    <button
                      key={`${symbol.line}:${symbol.kind}:${symbol.name}`}
                      type="button"
                      className="dcb-outline-row"
                      style={{ paddingLeft: 10 + Math.min(symbol.depth, 6) * 10 }}
                      onClick={() => jumpToLine(symbol.line)}
                      title={`${kindLabel(symbol.kind)} · ${symbol.name}`}
                    >
                      <span className={`dcb-sym-kind k-${symbol.kind}`}>{kindLetter(symbol.kind)}</span>
                      <span className="dcb-sym-name">{symbol.name}</span>
                      <span className="dcb-sym-line">{symbol.line}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selection && fileState.kind === 'ready' && (
            <div className="dcb-selection-bar">
              <span className="dcb-selection-range">{format(tr('lineRange'), { start: selection.start, end: selection.end })}</span>
              <button type="button" className="dcb-selection-quote" onClick={quote}>{icons.quote}<span>{tr('quoteSelected')}</span></button>
            </div>
          )}
        </main>
      </div>

      {toast && <div className="dcb-toast" role="status">{toast}</div>}
    </div>
  )
}

/* ── pure view pieces ───────────────────────────────────────────────────── */

function TreeLevel(props: {
  path: string
  depth: number
  levels: Record<string, LevelState>
  expanded: Set<string>
  currentFile: string | undefined
  showHidden: boolean
  tr: Translate
  onToggle: (path: string) => void
  onOpen: (path: string) => void
}) {
  const { path, depth, levels, expanded, currentFile, showHidden, tr, onToggle, onOpen } = props
  const state = levels[path]
  if (state === undefined || state.kind === 'loading') {
    return <div className="dcb-tree-message" style={{ paddingLeft: 16 + depth * 13 }}><span className="dcb-spinner dcb-spinner-small" />{tr('loading')}</div>
  }
  if (state.kind === 'error') {
    return <div className="dcb-tree-message dcb-tree-error" style={{ paddingLeft: 16 + depth * 13 }}>{failureText(state.code, state.message, tr)}</div>
  }
  const entries = orderEntries(state.level.entries).filter(entry => showHidden || !isIgnoredName(entry.name))
  if (entries.length === 0) {
    return <div className="dcb-tree-message" style={{ paddingLeft: 16 + depth * 13 }}>{tr('emptyDir')}</div>
  }
  return (
    <ul className="dcb-tree-list">
      {entries.map(entry => {
        const child = joinPath(path, entry.name)
        if (entry.type === 'directory') {
          const open = expanded.has(child)
          return (
            <li key={child}>
              <button
                type="button"
                className={`dcb-row${open ? ' is-open' : ''}`}
                style={{ paddingLeft: 8 + depth * 13 }}
                onClick={() => onToggle(child)}
                title={entry.name}
              >
                <span className={`dcb-chevron${open ? ' is-open' : ''}`}>
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m4 2.5 3.5 3.5L4 9.5" /></svg>
                </span>
                {typeof FileTypeIcon === 'function'
                  ? <FileTypeIcon kind="folder" size={15} aria-hidden />
                  : icons.folder}
                <span className="dcb-row-name">{entry.name}</span>
              </button>
              {open && (
                <TreeLevel
                  path={child} depth={depth + 1} levels={levels} expanded={expanded} currentFile={currentFile}
                  showHidden={showHidden} tr={tr} onToggle={onToggle} onOpen={onOpen}
                />
              )}
            </li>
          )
        }
        if (entry.type === 'file') {
          return (
            <li key={child}>
              <button
                type="button"
                className={`dcb-row${currentFile === child ? ' is-active' : ''}`}
                style={{ paddingLeft: 8 + depth * 13 }}
                onClick={() => onOpen(child)}
                title={entry.name}
              >
                <span className="dcb-chevron-spacer" />
                <FileGlyph name={entry.name} />
                <span className="dcb-row-name">{entry.name}</span>
              </button>
            </li>
          )
        }
        return (
          <li key={child}>
            <div className="dcb-row is-disabled" style={{ paddingLeft: 8 + depth * 13 }} title={tr('binary')}>
              <span className="dcb-chevron-spacer" />
              {icons.file}
              <span className="dcb-row-name">{entry.name}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function SearchList({ state, tr, onPick }: {
  state: SearchState
  tr: Translate
  onPick: (candidate: { path: string; kind: 'file' | 'directory' }) => void
}) {
  if (state.kind === 'loading') {
    return <div className="dcb-tree-message"><span className="dcb-spinner dcb-spinner-small" />{tr('searching')}</div>
  }
  if (state.kind === 'error') {
    return <div className="dcb-tree-message dcb-tree-error">{tr('searchFailed')}{state.message ? `: ${state.message}` : ''}</div>
  }
  if (state.kind !== 'ready') return null
  if (state.items.length === 0) {
    return <div className="dcb-tree-message">{tr('searchEmpty')}</div>
  }
  return (
    <ul className="dcb-tree-list dcb-search-results">
      {state.items.map((item, index) => {
        const path = item.path
        const name = item.name ?? fileNameOf(path) ?? path
        return (
          <li key={`${path}:${index}`}>
            <button type="button" className="dcb-row" onClick={() => onPick({ path, kind: item.kind })} title={path}>
              <span className="dcb-chevron-spacer" />
              {item.kind === 'directory' ? icons.folder : <FileGlyph name={name} />}
              <span className="dcb-row-name">{name}</span>
              <span className="dcb-row-path">{path}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
