import type { Context } from '@deepseek-ai/cordis'

/** Host half: the browser tab does all the work; this row only carries the client bundle. */
export const name = 'dsh-code-browser'
export const inject: string[] = []
export function apply(_ctx: Context): void {}
