import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

/**
 * After a client-side navigation to another page, moves focus to that page's <h1>.
 *
 * A full page load starts at the top of the new page, and a screen reader reads its title.
 * A <Link> click only swaps the content, so without this, focus would stay on the link
 * that was clicked, and a screen reader user would hear nothing about the new page.
 * Focusing the heading reads it out, and the next Tab continues from there.
 */
export function useFocusHeadingOnNavigate() {
  // The path of the page that has finished loading and rendering. Only the path, not the
  // search params: typing in a search box that updates `?q=` must not move focus away.
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname })
  const previous = useRef(pathname)

  useEffect(() => {
    const last = previous.current
    previous.current = pathname
    // The first page load (`last` is undefined until the router has resolved), or no change.
    if (last === undefined || last === pathname) return

    const main = document.getElementById('main')
    const heading = main?.querySelector('h1')
    const target = heading ?? main
    if (!target) return
    // tabIndex -1: focusable from code, but not a stop when pressing Tab.
    target.tabIndex = -1
    // The router's scroll restoration decides where the page scrolls, so don't scroll here.
    target.focus({ preventScroll: true })
  }, [pathname])
}
