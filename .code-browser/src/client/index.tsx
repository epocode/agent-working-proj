/** Browser plugin entry: register the read-only Code Browser tab in the right Sidebar. */
import type { Context } from '@deepseek-ai/cordis'
import { CodeBrowser } from './CodeBrowser'
import { en, zh, type CodeBrowserKey } from './locales'
import STYLES from './client.css?raw'

export const inject = [
  'slots',
  'locale',
  'sidebarRightTabs',
  'sidebarRight',
  'sessions',
  'remote',
  'remote.workspaceFiles',
  'remote.fileReferences',
  'conversation',
]

const NS = 'codeBrowser'
const ID = 'dsh-code-browser'
const KIND = 'code-browser'

function CodeGuideIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m8.5 7.5-4 4.5 4 4.5M15.5 7.5l4 4.5-4 4.5M13.6 4.8l-3.2 14.4" />
    </svg>
  )
}

export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS) as unknown as (key: CodeBrowserKey) => string

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshCodeBrowser = ''
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-code-browser: styles')

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-code-browser: dictionaries')

  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: ID,
    kind: KIND,
    priority: 'extension',
    keepMounted: true,
    title: () => t('type.label'),
    guide: [{
      id: 'browse',
      order: 20,
      title: () => t('type.label'),
      description: () => t('type.description'),
      icon: CodeGuideIcon,
    }],
  }), 'dsh-code-browser: tab type')

  const Body = (props: any) => (
    <CodeBrowser
      ctx={ctx}
      tr={t}
      sessionId={props.sessionId}
      useTabInfo={props.useTabInfo}
      useSessions={props.useSessions}
    />
  )

  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: ID,
    locale: NS,
  }, Body)), 'dsh-code-browser: tab body')
}
