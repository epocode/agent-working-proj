window.__ModuleLoader__.load({ id: "dsh-code-browser", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/CodeBrowser.tsx
var import_react = require("react");

// src/client/locales.ts
var zh = {
  "type.label": "\u4EE3\u7801\u6D4F\u89C8",
  "type.description": "\u53EA\u8BFB\u6D4F\u89C8\u5F53\u524D\u9879\u76EE\u7684\u6E90\u7801",
  "open": "\u6253\u5F00\u4EE3\u7801\u6D4F\u89C8",
  project: "\u9879\u76EE",
  files: "\u6587\u4EF6",
  tree: "\u6587\u4EF6\u6811",
  searchFiles: "\u641C\u7D22\u6587\u4EF6",
  searchPlaceholder: "\u8F93\u5165\u6587\u4EF6\u540D\u5FEB\u901F\u6253\u5F00\u2026",
  searching: "\u6B63\u5728\u641C\u7D22\u2026",
  searchEmpty: "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6",
  searchHint: "\u652F\u6301\u8DEF\u5F84\u7247\u6BB5\uFF0C\u4F8B\u5982 src/server",
  noWorkspace: "\u8FD9\u4E2A\u4F1A\u8BDD\u6CA1\u6709\u5DE5\u4F5C\u533A\u76EE\u5F55\u3002",
  loading: "\u6B63\u5728\u52A0\u8F7D\u2026",
  emptyDir: "\u7A7A\u76EE\u5F55",
  hiddenNotice: "\u5DF2\u9690\u85CF node_modules\u3001.git \u7B49\u76EE\u5F55",
  showHidden: "\u663E\u793A\u5168\u90E8",
  hideHidden: "\u9690\u85CF\u5E38\u7528\u5FFD\u7565\u9879",
  refresh: "\u5237\u65B0",
  outline: "\u5927\u7EB2",
  noOutline: "\u6CA1\u6709\u8BC6\u522B\u5230\u7B26\u53F7",
  wrap: "\u81EA\u52A8\u6362\u884C",
  nowrap: "\u4E0D\u6362\u884C",
  copy: "\u590D\u5236\u4EE3\u7801",
  copyPath: "\u590D\u5236\u8DEF\u5F84",
  copied: "\u5DF2\u590D\u5236",
  pathCopied: "\u8DEF\u5F84\u5DF2\u590D\u5236",
  quote: "\u5F15\u7528\u5230\u5BF9\u8BDD",
  quoteSelected: "\u5F15\u7528\u9009\u4E2D\u4EE3\u7801",
  quoted: "\u5DF2\u63D2\u5165\u5BF9\u8BDD\u8349\u7A3F",
  quoteCopied: "\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F",
  openPreview: "\u5728\u9884\u89C8\u4E2D\u6253\u5F00",
  binary: "\u8FD9\u4E0D\u662F\u6587\u672C\u6587\u4EF6\uFF0C\u65E0\u6CD5\u5728\u8FD9\u91CC\u663E\u793A\u3002",
  tooLarge: "\u6587\u4EF6\u8F83\u957F\uFF0C\u5DF2\u622A\u65AD\u663E\u793A\u3002",
  readError: "\u8BFB\u53D6\u5931\u8D25",
  notFound: "\u6587\u4EF6\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u79FB\u52A8\u3002",
  notText: "\u8FD9\u4E2A\u6587\u4EF6\u4E0D\u662F UTF-8 \u6587\u672C\u3002",
  outside: "\u8DEF\u5F84\u5728\u5DE5\u4F5C\u533A\u4E4B\u5916\u3002",
  emptyProject: "\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u5F00\u59CB\u9605\u8BFB",
  welcomeHint: "\u53EA\u8BFB\u6D4F\u89C8\uFF0C\u4E0D\u4F1A\u4FEE\u6539\u9879\u76EE\u3002\u9009\u4E2D\u4EE3\u7801\u540E\u53EF\u4EE5\u4E00\u952E\u5F15\u7528\u5230\u5BF9\u8BDD\u3002",
  startHere: "\u4ECE\u8FD9\u91CC\u5F00\u59CB",
  readme: "\u9879\u76EE\u8BF4\u660E",
  packageJson: "\u4F9D\u8D56\u4E0E\u811A\u672C",
  sourceDir: "\u6E90\u7801\u76EE\u5F55",
  lineRange: "\u7B2C {start}-{end} \u884C",
  lineCount: "{count} \u884C",
  truncated: "\u5DF2\u622A\u65AD",
  close: "\u5173\u95ED",
  back: "\u8FD4\u56DE",
  file: "\u6587\u4EF6",
  directory: "\u76EE\u5F55",
  retry: "\u91CD\u8BD5",
  openFailed: "\u6253\u5F00\u5931\u8D25",
  searchFailed: "\u641C\u7D22\u5931\u8D25",
  noSymbols: "\u8FD9\u4E2A\u6587\u4EF6\u6CA1\u6709\u53EF\u7528\u7684\u5927\u7EB2",
  jumpTo: "\u8DF3\u8F6C\u5230",
  selectionHint: "\u9009\u4E2D\u4EE3\u7801\u540E\u70B9\u8FD9\u91CC\u5F15\u7528",
  welcomeTitle: "\u5F00\u59CB\u9605\u8BFB\u8FD9\u4E2A\u9879\u76EE",
  welcomeBody: "\u5DE6\u4FA7\u662F\u9879\u76EE\u6587\u4EF6\u6811\u3002\u70B9\u5F00\u6587\u4EF6\u5373\u53EF\u9605\u8BFB\u6E90\u7801\uFF0C\u53F3\u4FA7\u5BF9\u8BDD\u53EF\u4EE5\u968F\u65F6\u63D0\u95EE\u3002",
  showTree: "\u663E\u793A\u6587\u4EF6\u6811",
  hideTree: "\u9690\u85CF\u6587\u4EF6\u6811",
  shortcutHint: "\u63D0\u793A\uFF1A\u628A\u4FA7\u680F\u62D6\u5BBD\u6216\u5207\u6362\u5168\u5C4F\uFF0C\u9605\u8BFB\u4EE3\u7801\u66F4\u8212\u670D\u3002",
  lines: "\u884C"
};
var en = {
  "type.label": "Code Browser",
  "type.description": "Read this project\u2019s source without leaving the chat",
  open: "Open Code Browser",
  project: "Project",
  files: "Files",
  tree: "File tree",
  searchFiles: "Search files",
  searchPlaceholder: "Type a file name to open\u2026",
  searching: "Searching\u2026",
  searchEmpty: "No matching files",
  searchHint: "Path fragments work too, e.g. src/server",
  noWorkspace: "This session has no workspace directory.",
  loading: "Loading\u2026",
  emptyDir: "Empty directory",
  hiddenNotice: "node_modules, .git, and similar folders are hidden",
  showHidden: "Show all",
  hideHidden: "Hide common ignored folders",
  refresh: "Refresh",
  outline: "Outline",
  noOutline: "No symbols found",
  wrap: "Wrap lines",
  nowrap: "Do not wrap",
  copy: "Copy code",
  copyPath: "Copy path",
  copied: "Copied",
  pathCopied: "Path copied",
  quote: "Quote to chat",
  quoteSelected: "Quote selection",
  quoted: "Inserted into the chat draft",
  quoteCopied: "Copied to the clipboard",
  openPreview: "Open in preview",
  binary: "This is not a text file, so it cannot be shown here.",
  tooLarge: "The file is long; only the beginning is shown.",
  readError: "Could not read the file",
  notFound: "The file no longer exists.",
  notText: "This file is not UTF-8 text.",
  outside: "The path is outside the workspace.",
  emptyProject: "Pick a file on the left to start reading",
  welcomeHint: "Read-only: nothing here modifies the project. Select code to quote it into the chat.",
  startHere: "Start here",
  readme: "Project readme",
  packageJson: "Dependencies and scripts",
  sourceDir: "Source directory",
  lineRange: "Lines {start}-{end}",
  lineCount: "{count} lines",
  truncated: "Truncated",
  close: "Close",
  back: "Back",
  file: "File",
  directory: "Directory",
  retry: "Retry",
  openFailed: "Could not open the file",
  searchFailed: "Search failed",
  noSymbols: "No outline is available for this file",
  jumpTo: "Jump to",
  selectionHint: "Select code, then quote it here",
  welcomeTitle: "Start reading this project",
  welcomeBody: "The left column is the project tree. Open any file to read it while you chat on the right.",
  showTree: "Show file tree",
  hideTree: "Hide file tree",
  shortcutHint: "Tip: widen the sidebar or switch to fullscreen for more room.",
  lines: "lines"
};
function format(template, values) {
  return template.replace(/\{(\w+)\}/g, (_match, key) => String(values[key] ?? `{${key}}`));
}

// src/client/files.ts
var IGNORED = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  ".hg",
  ".svn",
  ".codex-home",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "dist",
  "build",
  "out",
  "target",
  "coverage",
  ".cache",
  ".parcel-cache",
  ".turbo",
  "__pycache__",
  ".venv",
  "venv",
  ".tox",
  ".mypy_cache",
  ".pytest_cache",
  ".tmp",
  ".DS_Store",
  ".idea",
  ".vscode-test",
  ".pnpm-store",
  "vendor"
]);
function isIgnoredName(name) {
  return IGNORED.has(name);
}
var LANGUAGES = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  json: "json",
  jsonc: "jsonc",
  json5: "json5",
  md: "markdown",
  mdx: "mdx",
  markdown: "markdown",
  py: "python",
  pyw: "python",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "fish",
  ps1: "powershell",
  psm1: "powershell",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  html: "html",
  htm: "html",
  xml: "xml",
  svg: "xml",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  ini: "ini",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  cs: "csharp",
  fs: "fsharp",
  vb: "vb",
  php: "php",
  rb: "ruby",
  swift: "swift",
  scala: "scala",
  lua: "lua",
  r: "r",
  pl: "perl",
  pm: "perl",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  proto: "proto",
  prisma: "prisma",
  dockerfile: "dockerfile",
  diff: "diff",
  patch: "diff",
  m: "objective-c",
  mm: "objective-cpp",
  dart: "dart",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hs: "haskell",
  clj: "clojure",
  cljs: "clojure",
  groovy: "groovy",
  gradle: "groovy",
  txt: "text",
  log: "text",
  env: "bash",
  gitignore: "text",
  editorconfig: "ini"
};
function languageFor(name) {
  if (!name) return "text";
  const base = name.toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile.")) return "dockerfile";
  if (base === "makefile" || base === "gnumakefile") return "makefile";
  if (base === "cmakelists.txt") return "cmake";
  if (base === ".gitignore" || base === ".npmignore" || base === ".dockerignore") return "text";
  if (base === "package.json" || base === "tsconfig.json" || base === "composer.json") return "json";
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".") + 1) : "";
  return LANGUAGES[ext] ?? "text";
}
var BINARY = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "ico",
  "icns",
  "avif",
  "tif",
  "tiff",
  "pdf",
  "zip",
  "gz",
  "tgz",
  "bz2",
  "xz",
  "7z",
  "rar",
  "tar",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  "mp3",
  "wav",
  "ogg",
  "flac",
  "m4a",
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "numbers",
  "pages",
  "key",
  "wasm",
  "bin",
  "exe",
  "dll",
  "so",
  "dylib",
  "class",
  "jar",
  "pyc",
  "sqlite",
  "db",
  "lock"
]);
function isBinaryName(name) {
  const base = name.toLowerCase();
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".") + 1) : "";
  return BINARY.has(ext);
}
function normalizePath(value) {
  return value.replace(/\\/g, "/");
}
function isAbsolutePath(value) {
  return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value) || value.startsWith("\\\\");
}
function joinPath(root, value) {
  const child = normalizePath(value);
  if (isAbsolutePath(child)) return child;
  const clean = child.replace(/^(?:\.\/)+/, "");
  const base = root.replace(/[/\\]+$/, "");
  return clean === "" ? base : `${base}/${clean}`;
}
function relativeToRoot(root, value) {
  if (!value) return "";
  const normalized = normalizePath(value);
  const base = normalizePath(root).replace(/\/+$/, "");
  if (base !== "" && normalized === base) return "";
  if (base !== "" && normalized.startsWith(`${base}/`)) return normalized.slice(base.length + 1);
  return normalized;
}
function fileNameOf(value) {
  if (!value) return "";
  const normalized = normalizePath(value).replace(/\/+$/, "");
  const index = normalized.lastIndexOf("/");
  return index < 0 ? normalized : normalized.slice(index + 1);
}
function orderEntries(entries) {
  return [...entries].sort((a, b) => {
    const group = (entry) => entry.type === "directory" ? 0 : entry.type === "file" ? 1 : 2;
    const byGroup = group(a) - group(b);
    if (byGroup !== 0) return byGroup;
    return a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" });
  });
}
function failureOf(error) {
  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    return { code: String(error.code), message: String(error.message) };
  }
  return { code: "gateway/internal", message: error instanceof Error ? error.message : String(error) };
}
async function listDirectory(remote, sessionId, path, signal) {
  try {
    const result = await remote.workspaceFiles.list(sessionId, path, signal);
    if (!result?.ok) return { ok: false, error: failureOf(result?.error) };
    return { ok: true, value: { entries: result.value.entries ?? [], truncated: Boolean(result.value.truncated) } };
  } catch (error) {
    return { ok: false, error: failureOf(error) };
  }
}
var MAX_FILE_LINES = 5e3;
var PAGE_LINES = 500;
async function readTextFile(remote, sessionId, path, signal) {
  let offset = 1;
  let text = "";
  let lines = 0;
  let bytes;
  let version;
  let truncated = false;
  try {
    for (; ; ) {
      if (signal.aborted) return { ok: false, error: { code: "aborted", message: "aborted" } };
      const result = await remote.workspaceFiles.read(sessionId, path, { offset, limit: PAGE_LINES }, signal);
      if (!result?.ok) {
        if (text !== "") return { ok: true, value: { text, lines, eof: false, truncated: true, bytes, version } };
        return { ok: false, error: failureOf(result?.error) };
      }
      const page = result.value;
      bytes = page.bytes ?? bytes;
      version = page.version ?? version;
      if (page.lines === 0) return { ok: true, value: { text, lines, eof: true, truncated, bytes, version } };
      if (offset > 1 && text !== "") text += "\n";
      text += page.text;
      lines += page.lines;
      offset += page.lines;
      if (page.eof) return { ok: true, value: { text, lines, eof: true, truncated, bytes, version } };
      if (lines >= MAX_FILE_LINES) return { ok: true, value: { text, lines, eof: false, truncated: true, bytes, version } };
      truncated = true;
    }
  } catch (error) {
    return { ok: false, error: failureOf(error) };
  }
}
function failureText(code, message, t) {
  switch (code) {
    case "workspace-file/not-found":
      return t("notFound");
    case "workspace-file/not-text":
      return t("notText");
    case "workspace-file/outside-workspace":
      return t("outside");
    case "workspace-file/too-large":
      return t("tooLarge");
    default:
      return message ? `${t("readError")}: ${message}` : t("readError");
  }
}
function encodeSegment(segment) {
  return encodeURIComponent(segment).replace(/%3A/gi, ":");
}
function fileAddressFor(sessionId, cwd, path) {
  const normalized = normalizePath(path);
  const prefixed = normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) || normalized.startsWith("//");
  const root = cwd === void 0 ? "" : normalizePath(cwd).replace(/\/+$/, "");
  let relative = prefixed ? normalized : normalized.replace(/^(?:\.\/)+/, "");
  if (prefixed && root !== "") {
    if (normalized === root) relative = "";
    else if (normalized.startsWith(`${root}/`)) relative = normalized.slice(root.length + 1);
  }
  const encoded = relative.split("/").map(encodeSegment).join("/");
  return `dsh-resource://file/session/${encodeSegment(sessionId)}/${encoded}`;
}

// src/client/symbols.ts
var JS_RULES = [
  { kind: "class", pattern: /^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/ },
  { kind: "function", pattern: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/ },
  { kind: "constant", pattern: /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\()/ },
  { kind: "type", pattern: /^\s*(?:export\s+)?(?:declare\s+)?(?:interface|type|enum|namespace|module)\s+([A-Za-z_$][\w$]*)/ },
  { kind: "method", pattern: /^\s{2,}(?:(?:public|private|protected|static|async|override|readonly|get|set)\s+)*\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^{]+)?\{\s*$/ }
];
var PY_RULES = [
  { kind: "class", pattern: /^\s*class\s+([A-Za-z_]\w*)/ },
  { kind: "function", pattern: /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/ }
];
var GO_RULES = [
  { kind: "function", pattern: /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/ },
  { kind: "type", pattern: /^\s*type\s+([A-Za-z_]\w*)/ }
];
var RUST_RULES = [
  { kind: "function", pattern: /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_]\w*)/ },
  { kind: "type", pattern: /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:struct|enum|trait|union)\s+([A-Za-z_]\w*)/ },
  { kind: "impl", pattern: /^\s*impl(?:<[^>]*>)?\s+([A-Za-z_]\w*)/ }
];
var JVM_RULES = [
  { kind: "class", pattern: /^\s*(?:(?:public|private|protected|internal|abstract|final|static|sealed|open|data)\s+)*(?:class|interface|enum|record|object)\s+([A-Za-z_]\w*)/ },
  { kind: "function", pattern: /^\s*(?:(?:public|private|protected|internal|static|final|abstract|override|suspend|async)\s+)*(?:fun|void|boolean|int|long|float|double|string|char|byte|short|[A-Z]\w*(?:<[^>]*>)?)\s+([A-Za-z_]\w*)\s*\(/i }
];
var C_RULES = [
  { kind: "function", pattern: /^\s*(?:[A-Za-z_][\w:<>,*&\s]*\s+)+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:const\s*)?\{\s*$/ },
  { kind: "type", pattern: /^\s*(?:class|struct|enum|union|namespace)\s+([A-Za-z_]\w*)/ }
];
var SHELL_RULES = [
  { kind: "function", pattern: /^\s*(?:function\s+)?([A-Za-z_][\w-]*)\s*\(\s*\)\s*\{/ }
];
var SQL_RULES = [
  { kind: "table", pattern: /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW|FUNCTION|PROCEDURE)\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][\w.]*)/i }
];
var JS_CONTROL = /* @__PURE__ */ new Set(["if", "for", "while", "switch", "catch", "return", "function", "constructor", "else", "do", "try", "with"]);
function rulesFor(language) {
  switch (language) {
    case "typescript":
    case "tsx":
    case "javascript":
    case "jsx":
    case "json":
      return JS_RULES;
    case "python":
      return PY_RULES;
    case "go":
      return GO_RULES;
    case "rust":
      return RUST_RULES;
    case "java":
    case "kotlin":
    case "csharp":
    case "scala":
    case "groovy":
      return JVM_RULES;
    case "c":
    case "cpp":
    case "objective-c":
    case "objective-cpp":
      return C_RULES;
    case "bash":
    case "powershell":
      return SHELL_RULES;
    case "sql":
      return SQL_RULES;
    default:
      return [];
  }
}
function extractSymbols(text, name) {
  const language = languageFor(name);
  const lines = text.split("\n");
  const symbols = [];
  if (language === "markdown" || language === "mdx") {
    for (let index = 0; index < lines.length; index += 1) {
      const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(lines[index]);
      if (!match) continue;
      symbols.push({ name: match[2], kind: `h${match[1].length}`, line: index + 1, depth: match[1].length - 1 });
      if (symbols.length >= 400) break;
    }
    return symbols;
  }
  const rules = rulesFor(language);
  if (rules.length === 0) return [];
  let classIndent = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "" || /^\s*(\/\/|\/\*|\*|#)/.test(line)) continue;
    const indent = line.length - line.trimStart().length;
    let matched = false;
    for (const rule of rules) {
      const match = rule.pattern.exec(line);
      if (!match) continue;
      const symbolName = match[1];
      if (rule.kind === "method") {
        if (classIndent < 0 || indent <= classIndent) continue;
        if (JS_CONTROL.has(symbolName)) continue;
      }
      if (rule.kind === "class") classIndent = indent;
      else if (indent <= classIndent) classIndent = -1;
      symbols.push({ name: symbolName, kind: rule.kind, line: index + 1, depth: Math.max(0, Math.round(indent / 2)) });
      matched = true;
      break;
    }
    if (!matched && classIndent >= 0 && indent <= classIndent && line.trim() === "}") classIndent = -1;
    if (symbols.length >= 400) break;
  }
  return symbols;
}

// src/client/CodeBrowser.tsx
var primitives = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var CodeBlockView = primitives.CodeBlock;
var FileTypeIcon2 = primitives.FileTypeIcon;
var classifyFileType2 = primitives.classifyFileType;
var STORAGE = "dsh-code-browser.v1";
var MAX_QUOTE_LINES = 220;
var icons = {
  tree: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 2.5v11M3 5h4M3 8h4M3 11h4M7 5v6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "7", y: "3.5", width: "6", height: "3", rx: "0.8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "7", y: "9.5", width: "6", height: "3", rx: "0.8" })
  ] }),
  refresh: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13.2 7A5.2 5.2 0 1 0 12 11.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13.2 2.8V7H9" })
  ] }),
  outline: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 3.5h10M3 6.5h6M3 9.5h8M3 12.5h5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "12.8", cy: "6.5", r: "0.9", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "13.3", cy: "9.5", r: "0.9", fill: "currentColor", stroke: "none" })
  ] }),
  wrap: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 4h11M2.5 8h8.5a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.8 10.5 8 12l1.8 1.5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 12h3" })
  ] }),
  nowrap: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 4h11M2.5 8h11M2.5 12h6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.8 12h1.7" })
  ] }),
  copy: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "5.2", y: "5.2", width: "8", height: "8", rx: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.8 5.2V3.8A1.3 1.3 0 0 0 9.5 2.5h-5A1.3 1.3 0 0 0 3.2 3.8v5a1.3 1.3 0 0 0 1.3 1.3h1.4" })
  ] }),
  quote: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6.2 3.5H3.8A1.3 1.3 0 0 0 2.5 4.8v2.4a1.3 1.3 0 0 0 1.3 1.3h1.5v1.2c0 .9-.5 1.5-1.4 1.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13.5 3.5h-2.4a1.3 1.3 0 0 0-1.3 1.3v2.4a1.3 1.3 0 0 0 1.3 1.3h1.5v1.2c0 .9-.5 1.5-1.4 1.9" })
  ] }),
  search: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "7.2", cy: "7.2", r: "4.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m10.3 10.3 3 3" })
  ] }),
  close: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m4 4 8 8M12 4l-8 8" }) }),
  eye: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1.8 8s2.3-4.1 6.2-4.1S14.2 8 14.2 8s-2.3 4.1-6.2 4.1S1.8 8 1.8 8Z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "8", cy: "8", r: "1.8" })
  ] }),
  file: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 2.3h5.2L12.5 5.6v8.1H4z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.2 2.3v3.3h3.3" })
  ] }),
  folder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.2 4.4c0-.6.5-1.1 1.1-1.1h2.6l1.2 1.3h4.6c.6 0 1.1.5 1.1 1.1v6.2c0 .6-.5 1.1-1.1 1.1H3.3c-.6 0-1.1-.5-1.1-1.1z" }) })
};
function fileIconKind(name) {
  if (typeof classifyFileType2 !== "function") return "file";
  try {
    return classifyFileType2(name) ?? "file";
  } catch {
    return "file";
  }
}
function FileGlyph({ name, size = 15 }) {
  if (typeof FileTypeIcon2 !== "function") return icons.file;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileTypeIcon2, { kind: name === void 0 ? "folder" : fileIconKind(name), size, "aria-hidden": true });
}
function kindLetter(kind) {
  switch (kind) {
    case "class":
      return "C";
    case "function":
      return "\u0192";
    case "method":
      return "m";
    case "constant":
      return "K";
    case "type":
      return "T";
    case "impl":
      return "I";
    case "table":
      return "D";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "#";
    default:
      return "\u2022";
  }
}
function kindLabel(kind) {
  switch (kind) {
    case "class":
      return "class";
    case "function":
      return "function";
    case "method":
      return "method";
    case "constant":
      return "const";
    case "type":
      return "type";
    case "impl":
      return "impl";
    case "table":
      return "table";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    default:
      return "symbol";
  }
}
function selectionRange(container) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  if (!container || !selection.anchorNode || !selection.focusNode) return null;
  if (!container.contains(selection.anchorNode) || !container.contains(selection.focusNode)) return null;
  const lines = Array.from(container.querySelectorAll(".line"));
  if (lines.length === 0) return null;
  const lineOf = (node) => {
    let element = node instanceof Element ? node : node?.parentElement ?? null;
    while (element && element !== container) {
      if (element.classList.contains("line")) return lines.indexOf(element);
      element = element.parentElement;
    }
    return -1;
  };
  let a = lineOf(selection.anchorNode);
  let b = lineOf(selection.focusNode);
  if (a < 0 || b < 0) return null;
  if (a > b) [a, b] = [b, a];
  return { start: a + 1, end: b + 1 };
}
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
function CodeBrowser({ ctx, tr, sessionId, useTabInfo, useSessions }) {
  const { tab } = useTabInfo();
  const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
  const root = typeof cwd === "string" ? cwd : "";
  const [levels, setLevels] = (0, import_react.useState)({});
  const levelsRef = (0, import_react.useRef)(levels);
  levelsRef.current = levels;
  const controllers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const [expanded, setExpanded] = (0, import_react.useState)(/* @__PURE__ */ new Set());
  const expandedRef = (0, import_react.useRef)(expanded);
  expandedRef.current = expanded;
  const [currentFile, setCurrentFile] = (0, import_react.useState)(void 0);
  const [fileState, setFileState] = (0, import_react.useState)({ kind: "idle" });
  const [fileNonce, setFileNonce] = (0, import_react.useState)(0);
  const [query, setQuery] = (0, import_react.useState)("");
  const [search, setSearch] = (0, import_react.useState)({ kind: "idle" });
  const [showHidden, setShowHidden] = (0, import_react.useState)(false);
  const [wrap, setWrap] = (0, import_react.useState)(true);
  const [outlineOpen, setOutlineOpen] = (0, import_react.useState)(false);
  const [treeOpen, setTreeOpen] = (0, import_react.useState)(true);
  const [narrow, setNarrow] = (0, import_react.useState)(false);
  const [selection, setSelection] = (0, import_react.useState)(null);
  const [toast, setToast] = (0, import_react.useState)(void 0);
  const [reloadNonce, setReloadNonce] = (0, import_react.useState)(0);
  const wasNarrow = (0, import_react.useRef)(void 0);
  const toastTimer = (0, import_react.useRef)(void 0);
  const rootElement = (0, import_react.useRef)(null);
  const codeElement = (0, import_react.useRef)(null);
  const readController = (0, import_react.useRef)(void 0);
  const searchInput = (0, import_react.useRef)(null);
  const restored = (0, import_react.useRef)(false);
  const storageKey = `${STORAGE}.${sessionId}`;
  const showToast = (0, import_react.useCallback)((message) => {
    setToast(message);
    if (toastTimer.current !== void 0) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(void 0), 2200);
  }, []);
  const loadDir = (0, import_react.useCallback)(async (path) => {
    const previous = controllers.current.get(path);
    previous?.abort();
    const controller = new AbortController();
    controllers.current.set(path, controller);
    setLevels((state) => ({ ...state, [path]: { kind: "loading" } }));
    const result = await listDirectory(ctx.remote, sessionId, path, controller.signal);
    if (controllers.current.get(path) === controller) controllers.current.delete(path);
    if (controller.signal.aborted) return;
    setLevels((state) => {
      if (state[path]?.kind !== "loading") return state;
      if (result.ok) return { ...state, [path]: { kind: "ready", level: result.value } };
      return { ...state, [path]: { kind: "error", code: result.error.code, message: result.error.message } };
    });
  }, [ctx, sessionId]);
  (0, import_react.useEffect)(() => {
    const signal = tab.signal;
    const stop = () => {
      for (const controller of controllers.current.values()) controller.abort();
      controllers.current.clear();
      readController.current?.abort();
    };
    if (signal.aborted) stop();
    signal.addEventListener("abort", stop, { once: true });
    return () => signal.removeEventListener("abort", stop);
  }, [tab.signal]);
  (0, import_react.useEffect)(() => {
    if (!root) return;
    setExpanded(/* @__PURE__ */ new Set([root]));
    setCurrentFile(void 0);
    setFileState({ kind: "idle" });
    setQuery("");
    setSearch({ kind: "idle" });
    setSelection(null);
    restored.current = false;
    for (const controller of controllers.current.values()) controller.abort();
    controllers.current.clear();
    setLevels({});
  }, [root, sessionId]);
  (0, import_react.useEffect)(() => {
    if (!root) return;
    const wanted = /* @__PURE__ */ new Set([root, ...expanded]);
    for (const path of wanted) {
      if (!path.startsWith(root)) continue;
      if (levelsRef.current[path] === void 0 && !controllers.current.has(path)) void loadDir(path);
    }
  }, [root, expanded, reloadNonce, loadDir]);
  (0, import_react.useEffect)(() => {
    if (!root || restored.current) return;
    restored.current = true;
    let saved;
    try {
      saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    } catch {
      saved = null;
    }
    if (!saved || typeof saved !== "object") return;
    if (typeof saved.wrap === "boolean") setWrap(saved.wrap);
    if (typeof saved.showHidden === "boolean") setShowHidden(saved.showHidden);
    if (Array.isArray(saved.expanded)) {
      const next = /* @__PURE__ */ new Set([root, ...saved.expanded.filter((path) => typeof path === "string" && path.startsWith(root))]);
      setExpanded(next);
    }
    if (typeof saved.file === "string" && saved.file.startsWith(root)) setCurrentFile(saved.file);
  }, [root, storageKey]);
  (0, import_react.useEffect)(() => {
    if (!root) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({
          file: currentFile,
          expanded: [...expanded],
          wrap,
          showHidden
        }));
      } catch {
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [root, storageKey, currentFile, expanded, wrap, showHidden]);
  (0, import_react.useEffect)(() => {
    if (!currentFile) {
      setFileState({ kind: "idle" });
      return;
    }
    readController.current?.abort();
    const controller = new AbortController();
    readController.current = controller;
    if (isBinaryName(currentFile)) {
      setFileState({ kind: "binary", path: currentFile });
      return;
    }
    setFileState({ kind: "loading", path: currentFile });
    void readTextFile(ctx.remote, sessionId, currentFile, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) setFileState({ kind: "ready", path: currentFile, file: result.value });
      else setFileState({ kind: "error", path: currentFile, code: result.error.code, message: result.error.message });
    });
    return () => controller.abort();
  }, [ctx, sessionId, currentFile, fileNonce]);
  (0, import_react.useEffect)(() => {
    if (!currentFile || !root) return;
    const relative = relativeToRoot(root, currentFile);
    if (!relative) return;
    const parts = relative.split("/").slice(0, -1);
    if (parts.length === 0) return;
    let absolute = root;
    const ancestors = [];
    for (const part of parts) {
      absolute = joinPath(absolute, part);
      ancestors.push(absolute);
    }
    setExpanded((previous) => {
      let changed = false;
      const next = new Set(previous);
      for (const path of ancestors) if (!next.has(path)) {
        next.add(path);
        changed = true;
      }
      return changed ? next : previous;
    });
    for (const path of ancestors) {
      if (levelsRef.current[path] === void 0 && !controllers.current.has(path)) void loadDir(path);
    }
  }, [currentFile, root, loadDir]);
  (0, import_react.useEffect)(() => {
    const text = query.trim();
    if (text === "") {
      setSearch({ kind: "idle" });
      return;
    }
    const controller = new AbortController();
    setSearch({ kind: "loading" });
    const timer = window.setTimeout(() => {
      void ctx.remote.fileReferences.list(sessionId, text, controller.signal).then((result) => {
        if (controller.signal.aborted) return;
        if (result?.ok) {
          const items = Array.isArray(result.value) ? result.value : result.value?.items ?? [];
          setSearch({ kind: "ready", items });
        } else {
          setSearch({ kind: "error", message: result?.error?.message ?? "" });
        }
      }).catch((error) => {
        if (!controller.signal.aborted) setSearch({ kind: "error", message: error instanceof Error ? error.message : String(error) });
      });
    }, 160);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [ctx, sessionId, query]);
  (0, import_react.useEffect)(() => {
    const element = rootElement.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const next = width > 0 && width < 560;
      setNarrow(next);
      if (wasNarrow.current !== next) {
        wasNarrow.current = next;
        setTreeOpen(!next || currentFile === void 0);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [currentFile]);
  (0, import_react.useEffect)(() => {
    const update = () => setSelection(selectionRange(codeElement.current));
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);
  (0, import_react.useEffect)(() => {
    if (!outlineOpen) return;
    const close = (event) => {
      if (event.key === "Escape") setOutlineOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [outlineOpen]);
  const symbols = (0, import_react.useMemo)(() => {
    if (fileState.kind !== "ready") return [];
    return extractSymbols(fileState.file.text, fileState.path);
  }, [fileState]);
  const openFile = (0, import_react.useCallback)((path) => {
    setCurrentFile(path);
    setOutlineOpen(false);
    if (narrow) setTreeOpen(false);
  }, [narrow]);
  const toggleDir = (0, import_react.useCallback)((path) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        if (levelsRef.current[path] === void 0 && !controllers.current.has(path)) void loadDir(path);
      }
      return next;
    });
  }, [loadDir]);
  const refresh = (0, import_react.useCallback)(() => {
    for (const controller of controllers.current.values()) controller.abort();
    controllers.current.clear();
    setLevels({});
    setFileNonce((nonce) => nonce + 1);
    setReloadNonce((nonce) => nonce + 1);
  }, []);
  (0, import_react.useEffect)(() => tab.actions.bindCommands({ refresh }), [tab.actions, refresh]);
  const jumpToLine = (0, import_react.useCallback)((line) => {
    setOutlineOpen(false);
    const container = codeElement.current;
    if (!container) return;
    const rendered = Array.from(container.querySelectorAll(".line"));
    const target = rendered[line - 1];
    if (target) {
      const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      container.scrollTo({ top: Math.max(0, top - container.clientHeight / 2), behavior: "smooth" });
      target.classList.add("dcb-line-flash");
      window.setTimeout(() => target.classList.remove("dcb-line-flash"), 1600);
      return;
    }
    const computed = window.getComputedStyle(container);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 19;
    container.scrollTo({ top: Math.max(0, (line - 1) * lineHeight - 80), behavior: "smooth" });
  }, []);
  const quote = (0, import_react.useCallback)(() => {
    if (fileState.kind !== "ready") return;
    const source = fileState.file.text;
    const all = source.split("\n");
    let start = 1;
    let end = all.length;
    let body = source;
    if (selection && selection.start >= 1 && selection.end <= all.length) {
      start = selection.start;
      end = selection.end;
      body = all.slice(start - 1, end).join("\n");
    } else if (all.length > MAX_QUOTE_LINES) {
      end = MAX_QUOTE_LINES;
      body = all.slice(0, MAX_QUOTE_LINES).join("\n");
    }
    const relative = relativeToRoot(root, currentFile) || fileNameOf(currentFile);
    const lang = languageFor(currentFile);
    const whole = start === 1 && end === all.length;
    const heading = whole ? `\u8BF7\u89E3\u91CA @${relative} \u8FD9\u4E2A\u6587\u4EF6\uFF1A` : `\u8BF7\u89E3\u91CA @${relative} \u4E2D\u7B2C ${start}-${end} \u884C\uFF1A`;
    const snippet = `${heading}

\`\`\`${lang}
${body}
\`\`\`
`;
    const scope = ctx.sessions?.scope?.(sessionId);
    const input = scope && ctx.conversation ? ctx.conversation.input.for(scope) : void 0;
    if (input) {
      let previous = "";
      try {
        previous = input.state?.getSnapshot?.()?.draft ?? "";
      } catch {
        previous = "";
      }
      const next = previous.trim() === "" ? snippet : `${previous.trimEnd()}

${snippet}`;
      try {
        input.setDraft(next);
        input.focus();
        showToast(tr("quoted"));
        return;
      } catch {
      }
    }
    void copyText(snippet).then((ok) => showToast(ok ? tr("quoteCopied") : tr("readError")));
  }, [fileState, selection, root, currentFile, ctx, sessionId, showToast, tr]);
  const copyCode = (0, import_react.useCallback)(() => {
    if (fileState.kind !== "ready") return;
    void copyText(fileState.file.text).then((ok) => {
      if (ok) showToast(tr("copied"));
    });
  }, [fileState, showToast, tr]);
  const copyPath = (0, import_react.useCallback)((value) => {
    void copyText(value).then((ok) => {
      if (ok) showToast(tr("pathCopied"));
    });
  }, [showToast, tr]);
  const openPreview = (0, import_react.useCallback)(() => {
    if (!currentFile) return;
    try {
      tab.actions.openResource(fileAddressFor(sessionId, root, currentFile));
      if (narrow) setTreeOpen(false);
    } catch (error) {
      showToast(`${tr("openFailed")}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [tab.actions, sessionId, root, currentFile, narrow, showToast, tr]);
  const selectCandidate = (0, import_react.useCallback)((candidate) => {
    const absolute = joinPath(root, candidate.path);
    if (candidate.kind === "directory") {
      setQuery("");
      setExpanded((previous) => {
        const next = new Set(previous);
        next.add(absolute);
        return next;
      });
      if (levelsRef.current[absolute] === void 0 && !controllers.current.has(absolute)) void loadDir(absolute);
      return;
    }
    setQuery("");
    openFile(absolute);
  }, [root, openFile, loadDir]);
  const rootLevel = levels[root];
  const rootEntries = rootLevel?.kind === "ready" ? orderEntries(rootLevel.level.entries) : [];
  const quickFiles = rootEntries.filter((entry) => entry.type === "file" && /^(readme(\.|$)|package\.json$|pyproject\.toml$|cargo\.toml$|go\.mod$|makefile$|dockerfile$|compose\.ya?ml$)/i.test(entry.name)).slice(0, 4);
  const quickDirs = rootEntries.filter((entry) => entry.type === "directory" && !isIgnoredName(entry.name) && /^(src|app|lib|packages|server|web|cmd|internal)$/i.test(entry.name)).slice(0, 1);
  const tree = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "dcb-tree", "aria-label": tr("tree"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-tree-tools", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dcb-search", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-search-icon", children: icons.search }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            ref: searchInput,
            value: query,
            spellCheck: false,
            autoComplete: "off",
            placeholder: tr("searchPlaceholder"),
            "aria-label": tr("searchFiles"),
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Escape") setQuery("");
            }
          }
        ),
        query !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-search-clear", onClick: () => {
          setQuery("");
          searchInput.current?.focus();
        }, "aria-label": tr("close"), children: icons.close })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: `dcb-icon${showHidden ? " is-on" : ""}`,
          onClick: () => setShowHidden((value) => !value),
          title: showHidden ? tr("hideHidden") : tr("showHidden"),
          "aria-label": showHidden ? tr("hideHidden") : tr("showHidden"),
          "aria-pressed": showHidden,
          children: icons.eye
        }
      )
    ] }),
    !showHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-tree-note", title: tr("hiddenNotice"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-dot" }),
      tr("hiddenNotice")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-tree-scroll", children: query.trim() !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchList, { state: search, tr, onPick: selectCandidate }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      TreeLevel,
      {
        path: root,
        depth: 0,
        levels,
        expanded,
        currentFile,
        showHidden,
        tr,
        onToggle: toggleDir,
        onOpen: openFile
      }
    ) })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: rootElement,
      className: `dcb-root${narrow ? " is-narrow" : ""}${treeOpen ? " is-tree-open" : ""}`,
      "data-code-browser": "",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "dcb-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: `dcb-icon${treeOpen ? " is-on" : ""}`,
              onClick: () => setTreeOpen((value) => !value),
              title: treeOpen ? tr("hideTree") : tr("showTree"),
              "aria-label": treeOpen ? tr("hideTree") : tr("showTree"),
              "aria-expanded": treeOpen,
              children: icons.tree
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-project", onClick: () => copyPath(root), title: `${root}
${tr("copyPath")}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-project-name", children: fileNameOf(root) || root }),
            currentFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-crumb-sep", children: "/" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-file-name", children: relativeToRoot(root, currentFile) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-actions", children: [
            symbols.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: `dcb-icon${outlineOpen ? " is-on" : ""}`,
                onClick: () => setOutlineOpen((value) => !value),
                title: `${tr("outline")} (${symbols.length})`,
                "aria-label": tr("outline"),
                "aria-expanded": outlineOpen,
                children: icons.outline
              }
            ),
            fileState.kind === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "dcb-icon",
                  onClick: () => setWrap((value) => !value),
                  title: wrap ? tr("nowrap") : tr("wrap"),
                  "aria-label": wrap ? tr("nowrap") : tr("wrap"),
                  "aria-pressed": wrap,
                  children: wrap ? icons.wrap : icons.nowrap
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-icon", onClick: copyCode, title: tr("copy"), "aria-label": tr("copy"), children: icons.copy }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-quote", onClick: quote, title: tr("quote"), "aria-label": tr("quote"), children: [
                icons.quote,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-btn-label", children: tr("quote") })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-icon", onClick: refresh, title: tr("refresh"), "aria-label": tr("refresh"), children: icons.refresh })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-body", children: [
          treeOpen && tree,
          narrow && treeOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-drawer-backdrop", onClick: () => setTreeOpen(false) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "dcb-main", children: [
            fileState.kind === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-welcome", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-welcome-mark", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { size: 38 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: tr("welcomeTitle") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dcb-welcome-lede", children: tr("welcomeBody") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-project-card", onClick: () => copyPath(root), title: tr("copyPath"), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-project-card-label", children: tr("project") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-project-path", children: root }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-project-card-hint", children: tr("welcomeHint") })
              ] }),
              (quickFiles.length > 0 || quickDirs.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dcb-quick", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: tr("startHere") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-quick-grid", children: [
                  quickDirs.map((entry) => {
                    const path = joinPath(root, entry.name);
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-quick-card", onClick: () => {
                      setExpanded((previous) => new Set(previous).add(path));
                      if (!levelsRef.current[path]) void loadDir(path);
                      if (narrow) setTreeOpen(true);
                    }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-quick-icon", children: icons.folder }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dcb-quick-text", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: entry.name }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tr("sourceDir") })
                      ] })
                    ] }, path);
                  }),
                  quickFiles.map((entry) => {
                    const path = joinPath(root, entry.name);
                    const label = /^readme/i.test(entry.name) ? tr("readme") : entry.name === "package.json" ? tr("packageJson") : entry.name;
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-quick-card", onClick: () => openFile(path), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-quick-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { name: entry.name }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dcb-quick-text", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: entry.name }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: label })
                      ] })
                    ] }, path);
                  })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dcb-hint", children: tr("shortcutHint") }),
              narrow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-primary-button", onClick: () => setTreeOpen(true), children: [
                icons.tree,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("showTree") })
              ] })
            ] }),
            fileState.kind === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-state", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-spinner" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("loading") })
            ] }),
            fileState.kind === "binary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-state dcb-state-empty", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-state-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { name: fileNameOf(fileState.path), size: 34 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tr("binary") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-primary-button", onClick: openPreview, children: tr("openPreview") })
            ] }),
            fileState.kind === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-state dcb-state-empty", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-state-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { name: fileNameOf(fileState.path), size: 34 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: failureText(fileState.code, fileState.message, tr) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-state-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-primary-button", onClick: () => setFileNonce((nonce) => nonce + 1), children: tr("retry") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-ghost-button", onClick: openPreview, children: tr("openPreview") })
              ] })
            ] }),
            fileState.kind === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-code-scroll", ref: codeElement, children: typeof CodeBlockView === "function" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlockView, { code: fileState.file.text, lang: languageFor(fileState.path), lineNumbers: true, showHeader: false, wrap, className: "dcb-codeblock" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dcb-plain-code", children: fileState.file.text }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-status", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-status-lang", children: languageFor(fileState.path) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(tr("lineCount"), { count: fileState.file.lines }) }),
                fileState.file.truncated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-status-warn", title: tr("tooLarge"), children: tr("truncated") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-status-path", title: fileState.path, children: relativeToRoot(root, fileState.path) || fileNameOf(fileState.path) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-status-action", onClick: openPreview, children: tr("openPreview") })
              ] })
            ] }),
            outlineOpen && symbols.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-popover-backdrop", onClick: () => setOutlineOpen(false) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-outline", role: "dialog", "aria-label": tr("outline"), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-outline-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("outline") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-outline-count", children: symbols.length }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dcb-icon", onClick: () => setOutlineOpen(false), "aria-label": tr("close"), children: icons.close })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-outline-list", children: symbols.map((symbol) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: "dcb-outline-row",
                    style: { paddingLeft: 10 + Math.min(symbol.depth, 6) * 10 },
                    onClick: () => jumpToLine(symbol.line),
                    title: `${kindLabel(symbol.kind)} \xB7 ${symbol.name}`,
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dcb-sym-kind k-${symbol.kind}`, children: kindLetter(symbol.kind) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-sym-name", children: symbol.name }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-sym-line", children: symbol.line })
                    ]
                  },
                  `${symbol.line}:${symbol.kind}:${symbol.name}`
                )) })
              ] })
            ] }),
            selection && fileState.kind === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-selection-bar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-selection-range", children: format(tr("lineRange"), { start: selection.start, end: selection.end }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-selection-quote", onClick: quote, children: [
                icons.quote,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tr("quoteSelected") })
              ] })
            ] })
          ] })
        ] }),
        toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-toast", role: "status", children: toast })
      ]
    }
  );
}
function TreeLevel(props) {
  const { path, depth, levels, expanded, currentFile, showHidden, tr, onToggle, onOpen } = props;
  const state = levels[path];
  if (state === void 0 || state.kind === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-tree-message", style: { paddingLeft: 16 + depth * 13 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-spinner dcb-spinner-small" }),
      tr("loading")
    ] });
  }
  if (state.kind === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-tree-message dcb-tree-error", style: { paddingLeft: 16 + depth * 13 }, children: failureText(state.code, state.message, tr) });
  }
  const entries = orderEntries(state.level.entries).filter((entry) => showHidden || !isIgnoredName(entry.name));
  if (entries.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-tree-message", style: { paddingLeft: 16 + depth * 13 }, children: tr("emptyDir") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dcb-tree-list", children: entries.map((entry) => {
    const child = joinPath(path, entry.name);
    if (entry.type === "directory") {
      const open = expanded.has(child);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: `dcb-row${open ? " is-open" : ""}`,
            style: { paddingLeft: 8 + depth * 13 },
            onClick: () => onToggle(child),
            title: entry.name,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dcb-chevron${open ? " is-open" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 12 12", width: "10", height: "10", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m4 2.5 3.5 3.5L4 9.5" }) }) }),
              typeof FileTypeIcon2 === "function" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileTypeIcon2, { kind: "folder", size: 15, "aria-hidden": true }) : icons.folder,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-row-name", children: entry.name })
            ]
          }
        ),
        open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          TreeLevel,
          {
            path: child,
            depth: depth + 1,
            levels,
            expanded,
            currentFile,
            showHidden,
            tr,
            onToggle,
            onOpen
          }
        )
      ] }, child);
    }
    if (entry.type === "file") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: `dcb-row${currentFile === child ? " is-active" : ""}`,
          style: { paddingLeft: 8 + depth * 13 },
          onClick: () => onOpen(child),
          title: entry.name,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-chevron-spacer" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { name: entry.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-row-name", children: entry.name })
          ]
        }
      ) }, child);
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-row is-disabled", style: { paddingLeft: 8 + depth * 13 }, title: tr("binary"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-chevron-spacer" }),
      icons.file,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-row-name", children: entry.name })
    ] }) }, child);
  }) });
}
function SearchList({ state, tr, onPick }) {
  if (state.kind === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-tree-message", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-spinner dcb-spinner-small" }),
      tr("searching")
    ] });
  }
  if (state.kind === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dcb-tree-message dcb-tree-error", children: [
      tr("searchFailed"),
      state.message ? `: ${state.message}` : ""
    ] });
  }
  if (state.kind !== "ready") return null;
  if (state.items.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dcb-tree-message", children: tr("searchEmpty") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dcb-tree-list dcb-search-results", children: state.items.map((item, index) => {
    const path = item.path;
    const name = item.name ?? fileNameOf(path) ?? path;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dcb-row", onClick: () => onPick({ path, kind: item.kind }), title: path, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-chevron-spacer" }),
      item.kind === "directory" ? icons.folder : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileGlyph, { name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-row-name", children: name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dcb-row-path", children: path })
    ] }) }, `${path}:${index}`);
  }) });
}

// raw:/home/epoc/src/agent-working-proj/.code-browser/src/client/client.css
var client_default = "/* Read-only code browsing tab. Everything is scoped under .dcb-root. */\n\n.dcb-root {\n  --dcb-row-height: 24px;\n  --dcb-code-font: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-base);\n  font-size: var(--dsh-content-font-size-secondary, 13px);\n  line-height: 1.5;\n  overflow: hidden;\n}\n\n.dcb-root * { box-sizing: border-box; }\n\n.dcb-root button { font: inherit; color: inherit; }\n\n/* \u2500\u2500 top bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-header {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex: none;\n  height: 38px;\n  padding: 0 6px 0 6px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l3);\n  background: var(--dsw-alias-bg-base);\n  min-width: 0;\n}\n\n.dcb-project {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  min-width: 0;\n  flex: 1;\n  height: 28px;\n  padding: 0 6px;\n  border: 0;\n  border-radius: 6px;\n  background: transparent;\n  cursor: pointer;\n  text-align: left;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-project:hover { background: var(--dsw-alias-interactive-bg-hover); }\n\n.dcb-project > svg, .dcb-project > * { flex: none; }\n\n.dcb-project-name {\n  flex: none;\n  max-width: 34%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dcb-crumb-sep { flex: none; color: var(--dsw-alias-label-tertiary); }\n\n.dcb-file-name {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  direction: rtl;\n  text-align: left;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-actions {\n  display: flex;\n  align-items: center;\n  gap: 1px;\n  flex: none;\n}\n\n.dcb-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  border: 0;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  flex: none;\n}\n\n.dcb-icon:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.dcb-icon.is-on { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); }\n\n.dcb-quote {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  height: 28px;\n  margin-left: 2px;\n  padding: 0 9px 0 7px;\n  border: 0;\n  border-radius: 6px;\n  background: var(--dsw-alias-brand-primary);\n  color: var(--dsw-alias-label-primary-inverted);\n  cursor: pointer;\n  flex: none;\n  white-space: nowrap;\n  font-size: 12px;\n  font-weight: 500;\n}\n\n.dcb-quote:hover { filter: brightness(0.94); }\n\n/* \u2500\u2500 body layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-body {\n  display: flex;\n  flex: 1;\n  min-height: 0;\n  position: relative;\n}\n\n.dcb-main {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\n\n/* \u2500\u2500 tree \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-tree {\n  display: flex;\n  flex-direction: column;\n  flex: none;\n  width: clamp(180px, 42%, 340px);\n  min-width: 0;\n  min-height: 0;\n  border-right: 0.5px solid var(--dsw-alias-border-l3);\n  background: var(--dsw-alias-bg-base);\n}\n\n.dcb-tree-tools {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  padding: 8px 8px 6px 10px;\n  flex: none;\n}\n\n.dcb-search {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex: 1;\n  min-width: 0;\n  height: 28px;\n  padding: 0 6px 0 8px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 7px;\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-tertiary);\n  transition: border-color 120ms ease, box-shadow 120ms ease;\n}\n\n.dcb-search:focus-within {\n  border-color: var(--dsw-alias-state-business-primary);\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent);\n}\n\n.dcb-search-icon { display: inline-flex; flex: none; }\n\n.dcb-search input {\n  flex: 1;\n  min-width: 0;\n  border: 0;\n  outline: 0;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 12.5px;\n}\n\n.dcb-search input::placeholder { color: var(--dsw-alias-label-tertiary); }\n\n.dcb-search-clear {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n}\n\n.dcb-search-clear:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n\n.dcb-tree-note {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex: none;\n  padding: 2px 12px 6px 13px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11.5px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.dcb-dot {\n  width: 5px;\n  height: 5px;\n  border-radius: 999px;\n  background: var(--dsw-alias-state-warn-primary);\n  flex: none;\n  opacity: 0.75;\n}\n\n.dcb-tree-scroll {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  padding: 0 6px 12px 6px;\n  scrollbar-gutter: stable;\n}\n\n.dcb-tree-list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n.dcb-row {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  width: 100%;\n  height: var(--dcb-row-height);\n  padding-right: 6px;\n  border: 0;\n  border-radius: 5px;\n  background: transparent;\n  text-align: left;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  white-space: nowrap;\n  font-size: 12.5px;\n}\n\n.dcb-row:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.dcb-row.is-active { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); font-weight: 500; }\n.dcb-row.is-disabled { color: var(--dsw-alias-label-tertiary); cursor: default; }\n.dcb-row.is-disabled:hover { background: transparent; color: var(--dsw-alias-label-tertiary); }\n\n.dcb-row > svg { flex: none; }\n\n.dcb-row-name {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.dcb-row-path {\n  margin-left: auto;\n  padding-left: 10px;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n}\n\n.dcb-chevron {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 12px;\n  height: 12px;\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n  transition: transform 120ms ease;\n}\n\n.dcb-chevron.is-open { transform: rotate(90deg); }\n\n.dcb-chevron-spacer { width: 12px; flex: none; }\n\n.dcb-tree-message {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  padding: 5px 8px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n}\n\n.dcb-tree-error { color: var(--dsw-alias-state-error-primary); }\n\n/* \u2500\u2500 welcome / states \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-welcome {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 34px clamp(20px, 8%, 54px) 28px;\n  overflow: auto;\n  flex: 1;\n  min-height: 0;\n}\n\n.dcb-welcome-mark {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 54px;\n  height: 54px;\n  border-radius: 14px;\n  background: var(--dsw-alias-bg-layer-1);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-welcome h2 {\n  margin: 0;\n  font-size: 17px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n}\n\n.dcb-welcome-lede {\n  margin: -4px 0 2px;\n  max-width: 420px;\n  color: var(--dsw-alias-label-secondary);\n  line-height: 1.6;\n}\n\n.dcb-project-card {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  width: 100%;\n  padding: 12px 14px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-1);\n  text-align: left;\n  cursor: pointer;\n}\n\n.dcb-project-card:hover { border-color: var(--dsw-alias-border-l3); background: var(--dsw-alias-interactive-bg-hover); }\n\n.dcb-project-card-label {\n  font-size: 10.5px;\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dcb-project-path {\n  font-family: var(--dcb-code-font);\n  font-size: 12px;\n  color: var(--dsw-alias-label-primary);\n  word-break: break-all;\n}\n\n.dcb-project-card-hint {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11.5px;\n}\n\n.dcb-quick { width: 100%; }\n\n.dcb-quick h3 {\n  margin: 4px 0 8px;\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-quick-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));\n  gap: 8px;\n}\n\n.dcb-quick-card {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  min-width: 0;\n  padding: 9px 10px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 9px;\n  background: var(--dsw-alias-bg-layer-1);\n  text-align: left;\n  cursor: pointer;\n}\n\n.dcb-quick-card:hover { background: var(--dsw-alias-interactive-bg-hover); border-color: var(--dsw-alias-border-l3); }\n\n.dcb-quick-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  flex: none;\n  border-radius: 7px;\n  background: var(--dsw-alias-bg-multi-select);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-quick-text { display: flex; flex-direction: column; min-width: 0; gap: 1px; }\n.dcb-quick-text strong { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.dcb-quick-text small { color: var(--dsw-alias-label-tertiary); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n.dcb-hint { margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }\n\n.dcb-primary-button, .dcb-ghost-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  height: 30px;\n  padding: 0 12px;\n  border-radius: 7px;\n  cursor: pointer;\n  font-size: 12.5px;\n}\n\n.dcb-primary-button {\n  border: 0;\n  background: var(--dsw-alias-brand-primary);\n  color: var(--dsw-alias-label-primary-inverted);\n}\n\n.dcb-ghost-button {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.dcb-ghost-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n\n.dcb-state {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 9px;\n  flex: 1;\n  min-height: 0;\n  padding: 24px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dcb-state-empty { flex-direction: column; text-align: center; gap: 10px; }\n.dcb-state-empty p { margin: 0; max-width: 330px; color: var(--dsw-alias-label-secondary); line-height: 1.6; }\n.dcb-state-icon { color: var(--dsw-alias-label-tertiary); }\n.dcb-state-actions { display: flex; gap: 8px; }\n\n.dcb-spinner {\n  display: inline-block;\n  width: 14px;\n  height: 14px;\n  flex: none;\n  border: 1.6px solid color-mix(in srgb, currentColor 22%, transparent);\n  border-top-color: currentColor;\n  border-radius: 999px;\n  animation: dcb-spin 0.75s linear infinite;\n}\n\n.dcb-spinner-small { width: 11px; height: 11px; border-width: 1.3px; }\n\n@keyframes dcb-spin { to { transform: rotate(360deg); } }\n\n/* \u2500\u2500 code \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-code-scroll {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n  padding: 0;\n}\n\n.dcb-codeblock {\n  min-width: 100%;\n  width: max-content;\n  max-width: 100%;\n}\n\n.dcb-codeblock .md-code-block,\n.dcb-codeblock.md-code-block {\n  margin: 0;\n  border: 0;\n  border-radius: 0;\n  background: transparent;\n}\n\n.dcb-codeblock pre {\n  margin: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n  overflow: visible !important;\n}\n\n.dcb-code-scroll .line { display: block; min-height: 1.55em; }\n.dcb-code-scroll .line:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.dcb-code-scroll .line.dcb-line-flash { background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent); transition: background 180ms ease; }\n\n.dcb-plain-code {\n  margin: 0;\n  padding: 12px 14px;\n  font-family: var(--dcb-code-font);\n  font-size: var(--dsh-code-font-size, 11.5px);\n  line-height: 1.55;\n  white-space: pre;\n}\n\n.dcb-status {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  flex: none;\n  height: 24px;\n  padding: 0 10px;\n  border-top: 0.5px solid var(--dsw-alias-border-l3);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 10.5px;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\n.dcb-status-lang { color: var(--dsw-alias-label-secondary); }\n.dcb-status-warn { color: var(--dsw-alias-state-warn-label); }\n.dcb-status-path { margin-left: auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; direction: rtl; text-align: left; }\n.dcb-status-action { border: 0; background: transparent; color: var(--dsw-alias-link); cursor: pointer; padding: 0; font-size: 10.5px; flex: none; }\n.dcb-status-action:hover { text-decoration: underline; }\n\n/* \u2500\u2500 outline popover \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-popover-backdrop {\n  position: absolute;\n  inset: 0;\n  z-index: 40;\n  background: transparent;\n}\n\n.dcb-outline {\n  position: absolute;\n  top: 6px;\n  right: 6px;\n  z-index: 41;\n  display: flex;\n  flex-direction: column;\n  width: min(300px, calc(100% - 12px));\n  max-height: min(70%, 460px);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-1);\n  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px #00000014);\n  overflow: hidden;\n}\n\n.dcb-outline-head {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  flex: none;\n  height: 34px;\n  padding: 0 5px 0 12px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l3);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.dcb-outline-head .dcb-icon { margin-left: auto; width: 24px; height: 24px; }\n\n.dcb-outline-count {\n  padding: 0 6px;\n  height: 16px;\n  border-radius: 999px;\n  background: var(--dsw-alias-bg-multi-select);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 10px;\n  font-weight: 500;\n  line-height: 16px;\n}\n\n.dcb-outline-list { overflow: auto; padding: 4px; min-height: 0; }\n\n.dcb-outline-row {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  width: 100%;\n  height: 25px;\n  padding-right: 8px;\n  border: 0;\n  border-radius: 5px;\n  background: transparent;\n  text-align: left;\n  cursor: pointer;\n  white-space: nowrap;\n}\n\n.dcb-outline-row:hover { background: var(--dsw-alias-interactive-bg-hover); }\n\n.dcb-sym-kind {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 16px;\n  height: 16px;\n  flex: none;\n  border-radius: 4px;\n  background: var(--dsw-alias-bg-multi-select);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 9.5px;\n  font-weight: 600;\n  font-family: var(--dcb-code-font);\n}\n\n.dcb-sym-kind.k-class, .dcb-sym-kind.k-type { color: var(--dsw-alias-state-warn-label); }\n.dcb-sym-kind.k-function, .dcb-sym-kind.k-method { color: var(--dsw-alias-state-business-primary); }\n.dcb-sym-kind.k-constant { color: var(--dsw-alias-state-success-primary); }\n.dcb-sym-kind.k-h1, .dcb-sym-kind.k-h2, .dcb-sym-kind.k-h3, .dcb-sym-kind.k-h4, .dcb-sym-kind.k-h5, .dcb-sym-kind.k-h6 { color: var(--dsw-alias-label-secondary); }\n\n.dcb-sym-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; font-family: var(--dcb-code-font); font-size: 11.5px; }\n.dcb-sym-line { margin-left: auto; padding-left: 10px; color: var(--dsw-alias-label-tertiary); font-size: 10px; font-variant-numeric: tabular-nums; }\n\n/* \u2500\u2500 selection bar / toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-selection-bar {\n  position: absolute;\n  left: 50%;\n  bottom: 34px;\n  transform: translateX(-50%);\n  z-index: 30;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 5px 6px 5px 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 999px;\n  background: var(--dsw-alias-bg-layer-2);\n  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px #00000014);\n  white-space: nowrap;\n}\n\n.dcb-selection-range { color: var(--dsw-alias-label-tertiary); font-size: 11px; }\n\n.dcb-selection-quote {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  height: 26px;\n  padding: 0 10px 0 8px;\n  border: 0;\n  border-radius: 999px;\n  background: var(--dsw-alias-brand-primary);\n  color: var(--dsw-alias-label-primary-inverted);\n  font-size: 11.5px;\n  font-weight: 500;\n  cursor: pointer;\n}\n\n.dcb-toast {\n  position: absolute;\n  left: 50%;\n  bottom: 16px;\n  transform: translateX(-50%);\n  z-index: 60;\n  max-width: min(80%, 420px);\n  padding: 7px 12px;\n  border-radius: 8px;\n  background: var(--dsw-alias-toast-bg);\n  color: var(--dsw-alias-toast-label);\n  font-size: 12px;\n  box-shadow: var(--dsw-elevation-panel, 0 8px 24px #0000001f);\n  animation: dcb-toast-in 140ms ease-out;\n}\n\n@keyframes dcb-toast-in {\n  from { opacity: 0; transform: translate(-50%, 4px); }\n  to { opacity: 1; transform: translate(-50%, 0); }\n}\n\n/* \u2500\u2500 narrow panel: the tree becomes a drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dcb-root.is-narrow .dcb-tree {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 50;\n  width: min(320px, 88%);\n  border-right: 0.5px solid var(--dsw-alias-border-l2);\n  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px #00000014);\n}\n\n.dcb-drawer-backdrop {\n  position: absolute;\n  inset: 0;\n  z-index: 49;\n  background: color-mix(in srgb, var(--dsw-alias-bg-mask-1) 55%, transparent);\n  animation: dcb-fade-in 120ms ease-out;\n}\n\n@keyframes dcb-fade-in { from { opacity: 0; } to { opacity: 1; } }\n\n.dcb-root.is-narrow .dcb-btn-label { display: none; }\n.dcb-root.is-narrow .dcb-quote { width: 28px; padding: 0; justify-content: center; }\n.dcb-root.is-narrow .dcb-project-name { max-width: 40%; }\n.dcb-root.is-narrow .dcb-welcome { padding: 24px 18px; }\n.dcb-root.is-narrow .dcb-quick-grid { grid-template-columns: 1fr 1fr; }\n\n@media (prefers-reduced-motion: reduce) {\n  .dcb-spinner { animation-duration: 2.4s; }\n  .dcb-toast, .dcb-drawer-backdrop { animation: none; }\n}\n";

// src/client/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var inject = [
  "slots",
  "locale",
  "sidebarRightTabs",
  "sidebarRight",
  "sessions",
  "remote",
  "remote.workspaceFiles",
  "remote.fileReferences",
  "conversation"
];
var NS = "codeBrowser";
var ID = "dsh-code-browser";
var KIND = "code-browser";
function CodeGuideIcon({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m8.5 7.5-4 4.5 4 4.5M15.5 7.5l4 4.5-4 4.5M13.6 4.8l-3.2 14.4" }) });
}
function apply(ctx) {
  const t = ctx.locale.bind(NS);
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.dshCodeBrowser = "";
    style.textContent = client_default;
    document.head.appendChild(style);
    return () => style.remove();
  }, "dsh-code-browser: styles");
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-code-browser: dictionaries");
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: ID,
    kind: KIND,
    priority: "extension",
    keepMounted: true,
    title: () => t("type.label"),
    guide: [{
      id: "browse",
      order: 20,
      title: () => t("type.label"),
      description: () => t("type.description"),
      icon: CodeGuideIcon
    }]
  }), "dsh-code-browser: tab type");
  const Body = (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    CodeBrowser,
    {
      ctx,
      tr: t,
      sessionId: props.sessionId,
      useTabInfo: props.useTabInfo,
      useSessions: props.useSessions
    }
  );
  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
    name: "sidebar.right.pane.tab",
    key: ID,
    locale: NS
  }, Body)), "dsh-code-browser: tab body");
}
return module.exports; } });
