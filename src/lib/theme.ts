import { useSyncExternalStore } from 'react'

// "system" follows the operating system's setting; light and dark override it.
export const themes = ['light', 'dark', 'system'] as const
export type Theme = (typeof themes)[number]

// The choice lives in localStorage, in this browser only. The server never sees it, which is why
// the script below has to apply it in the browser.
const storageKey = 'mise-theme'

// "system" is never saved: it's what you get when nothing (or nonsense) is saved.
export function parseTheme(value: string | null): Theme {
  return value === 'light' || value === 'dark' ? value : 'system'
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

// The theme as applied to the page: <html data-theme="dark">, or no attribute for system.
// CSS (app.css) turns the attribute into `color-scheme`.
function getAppliedTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme ?? null)
}

function applyTheme(theme: Theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

// Components that show the theme, to be told when it changes.
const listeners = new Set<() => void>()

export function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    if (theme === 'system') localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, theme)
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
    applyTheme(parseTheme(event.newValue))
    listener()
  }
  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// React's way to read a value that lives outside React. The third function is what the server
// renders (it can't know the choice), and what the browser uses while hydrating, so the two
// match; React then re-renders with the real value straight away.
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getAppliedTheme, () => 'system')
}
