import { useSyncExternalStore } from 'react'

export const themes = ['light', 'dark'] as const
export type Theme = (typeof themes)[number]

// The choice lives in localStorage, in this browser only. The server never sees it, which is why
// the script below has to apply it in the browser. Until someone chooses, nothing is saved and the
// page follows the system setting.
const storageKey = 'mise-theme'

// null: no choice yet (nothing saved, or a value we don't know).
export function parseTheme(value: string | null): Theme | null {
  return value === 'light' || value === 'dark' ? value : null
}

// Runs in <head> as an inline script (see __root.tsx), before the browser reads <body>, so the
// first paint already has the right colours: no white flash for someone who chose dark.
// It runs before React or any of our modules have loaded, so it can't call parseTheme() or use
// storageKey from this file: it only gets what's passed in as an argument.
function applySavedTheme(key: string) {
  try {
    const saved = localStorage.getItem(key)
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved
  } catch {
    // The browser blocks storage: follow the system setting.
  }
}

// An inline <script> takes source text, so toString() turns the function back into its code
// (as compiled JavaScript, without the types), and the text calls it with the storage key:
// (function applySavedTheme(key) { ... })("mise-theme")
export const themeScript = `(${applySavedTheme.toString()})(${JSON.stringify(storageKey)})`

// The system setting, as CSS sees it (prefers-color-scheme).
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)')

// The theme the page shows: the choice on <html data-theme="...">, or else the system's.
// CSS (app.css) turns the attribute into `color-scheme`.
function getShownTheme(): Theme {
  return (
    parseTheme(document.documentElement.dataset.theme ?? null) ??
    (systemDark().matches ? 'dark' : 'light')
  )
}

// Components that show the theme, to be told when it changes.
const listeners = new Set<() => void>()

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(storageKey, theme)
  } catch {
    // Storage is blocked: the choice still applies until the page is closed.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  // The `storage` event fires when another tab changes localStorage, so a choice made in one
  // tab shows up in the others too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) return
    const theme = parseTheme(event.newValue)
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme
    listener()
  }
  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  // Before a choice, the toggle shows the system's theme, so it must also hear when that changes.
  const media = systemDark()
  media.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
    media.removeEventListener('change', listener)
  }
}

// React's way to read a value that lives outside React. The third function is what the server
// renders, and what the browser uses while hydrating, so the two match. The server can't know
// the theme (the choice is in localStorage, the system setting is in the browser), so it's
// undefined there and the toggle starts with nothing chosen; React then re-renders with the
// real theme straight away.
export function useTheme(): Theme | undefined {
  return useSyncExternalStore(subscribe, getShownTheme, () => undefined)
}
