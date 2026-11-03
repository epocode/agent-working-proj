/** A lightweight, read-only outline for the languages a code reader meets most often. */
import { languageFor } from './files'

export interface CodeSymbol {
  readonly name: string
  readonly kind: string
  readonly line: number
  readonly depth: number
}

interface Rule {
  readonly kind: string
  readonly pattern: RegExp
}

const JS_RULES: readonly Rule[] = [
  { kind: 'class', pattern: /^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/ },
  { kind: 'function', pattern: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/ },
  { kind: 'constant', pattern: /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()/ },
  { kind: 'type', pattern: /^\s*(?:export\s+)?(?:declare\s+)?(?:interface|type|enum|namespace|module)\s+([A-Za-z_$][\w$]*)/ },
  { kind: 'method', pattern: /^\s{2,}(?:(?:public|private|protected|static|async|override|readonly|get|set)\s+)*\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^{]+)?\{\s*$/ },
]

const PY_RULES: readonly Rule[] = [
  { kind: 'class', pattern: /^\s*class\s+([A-Za-z_]\w*)/ },
  { kind: 'function', pattern: /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/ },
]

const GO_RULES: readonly Rule[] = [
  { kind: 'function', pattern: /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/ },
  { kind: 'type', pattern: /^\s*type\s+([A-Za-z_]\w*)/ },
]

const RUST_RULES: readonly Rule[] = [
  { kind: 'function', pattern: /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_]\w*)/ },
  { kind: 'type', pattern: /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:struct|enum|trait|union)\s+([A-Za-z_]\w*)/ },
  { kind: 'impl', pattern: /^\s*impl(?:<[^>]*>)?\s+([A-Za-z_]\w*)/ },
]

const JVM_RULES: readonly Rule[] = [
  { kind: 'class', pattern: /^\s*(?:(?:public|private|protected|internal|abstract|final|static|sealed|open|data)\s+)*(?:class|interface|enum|record|object)\s+([A-Za-z_]\w*)/ },
  { kind: 'function', pattern: /^\s*(?:(?:public|private|protected|internal|static|final|abstract|override|suspend|async)\s+)*(?:fun|void|boolean|int|long|float|double|string|char|byte|short|[A-Z]\w*(?:<[^>]*>)?)\s+([A-Za-z_]\w*)\s*\(/i },
]

const C_RULES: readonly Rule[] = [
  { kind: 'function', pattern: /^\s*(?:[A-Za-z_][\w:<>,*&\s]*\s+)+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:const\s*)?\{\s*$/ },
  { kind: 'type', pattern: /^\s*(?:class|struct|enum|union|namespace)\s+([A-Za-z_]\w*)/ },
]

const SHELL_RULES: readonly Rule[] = [
  { kind: 'function', pattern: /^\s*(?:function\s+)?([A-Za-z_][\w-]*)\s*\(\s*\)\s*\{/ },
]

const SQL_RULES: readonly Rule[] = [
  { kind: 'table', pattern: /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW|FUNCTION|PROCEDURE)\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][\w.]*)/i },
]

/** Method-like JS lines that are control flow, not symbols. */
const JS_CONTROL = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'constructor', 'else', 'do', 'try', 'with'])

function rulesFor(language: string): readonly Rule[] {
  switch (language) {
    case 'typescript': case 'tsx': case 'javascript': case 'jsx': case 'json':
      return JS_RULES
    case 'python': return PY_RULES
    case 'go': return GO_RULES
    case 'rust': return RUST_RULES
    case 'java': case 'kotlin': case 'csharp': case 'scala': case 'groovy': return JVM_RULES
    case 'c': case 'cpp': case 'objective-c': case 'objective-cpp': return C_RULES
    case 'bash': case 'powershell': return SHELL_RULES
    case 'sql': return SQL_RULES
    default: return []
  }
}

/** Extract an outline from a file's source. Returns at most 400 entries. */
export function extractSymbols(text: string, name: string | undefined): CodeSymbol[] {
  const language = languageFor(name)
  const lines = text.split('\n')
  const symbols: CodeSymbol[] = []

  if (language === 'markdown' || language === 'mdx') {
    for (let index = 0; index < lines.length; index += 1) {
      const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[index])
      if (!match) continue
      symbols.push({ name: match[2], kind: `h${match[1].length}`, line: index + 1, depth: match[1].length - 1 })
      if (symbols.length >= 400) break
    }
    return symbols
  }

  const rules = rulesFor(language)
  if (rules.length === 0) return []

  let classIndent = -1
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim() === '' || /^\s*(\/\/|\/\*|\*|#)/.test(line)) continue
    const indent = line.length - line.trimStart().length
    let matched = false
    for (const rule of rules) {
      const match = rule.pattern.exec(line)
      if (!match) continue
      const symbolName = match[1]
      if (rule.kind === 'method') {
        if (classIndent < 0 || indent <= classIndent) continue
        if (JS_CONTROL.has(symbolName)) continue
      }
      if (rule.kind === 'class') classIndent = indent
      else if (indent <= classIndent) classIndent = -1
      symbols.push({ name: symbolName, kind: rule.kind, line: index + 1, depth: Math.max(0, Math.round(indent / 2)) })
      matched = true
      break
    }
    if (!matched && classIndent >= 0 && indent <= classIndent && line.trim() === '}') classIndent = -1
    if (symbols.length >= 400) break
  }
  return symbols
}
