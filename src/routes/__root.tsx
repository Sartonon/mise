/// <reference types="vite/client" />
// ^ Vite's types for imports that aren't code, like `?url` below.
import { createRootRoute, HeadContent, Outlet, Scripts, useHydrated } from '@tanstack/react-router'
import { NavBar } from '~/components/NavBar'
import { NotFound } from '~/components/NotFound'
import { useFocusHeadingOnNavigate } from '~/lib/useFocusHeadingOnNavigate'
// `?url` gives the stylesheet's address instead of its contents, so it can go in a <link>
// below. The server then sends the CSS with the HTML, and the page never shows unstyled.
import appCss from '~/styles/app.css?url'

// The root route wraps every page. Because Start renders on the server,
// it owns the whole HTML document, not just a <div id="root">.
export const Route = createRootRoute({
  // Tags for <head>. Child routes can add their own (for example a page title).
  head: ({ matches }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // Tells the browser before any CSS arrives that the page has a dark version, so in
      // dark mode it doesn't flash a white background while loading.
      { name: 'color-scheme', content: 'light dark' },
      // The title is the first thing a screen reader reads on a new page (and what a tab
      // or bookmark shows), so the not-found page says so there too, not just in its <h1>.
      // Every page is a child route, so when only this root route matched, there is no
      // page at this URL.
      { title: matches.length === 1 ? 'Page not found · Mise' : 'Mise' },
    ],
    // Files in public/ are served from the site root as they are.
    // Browsers that support SVG icons use the sharp SVG; older ones fall back to the .ico.
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootDocument,
  // Rendered inside RootDocument in place of the page, so the nav bar stays.
  // Without it, the router warns and shows a bare <p>Not Found</p>.
  notFoundComponent: NotFound,
})

function RootDocument() {
  // False while rendering on the server (and during the browser's first render, so the two
  // match), then true once React has taken over the page in the browser ("hydrated").
  const hydrated = useHydrated()
  useFocusHeadingOnNavigate()

  return (
    <html lang="en">
      <head>
        {/* Renders the tags from `head` above. */}
        <HeadContent />
      </head>
      {/* Lets e2e tests wait until links work without a full page load. */}
      <body data-hydrated={hydrated || undefined}>
        {/* The first thing Tab reaches: keyboard and screen reader users can jump past the
            navigation, straight to the page's content. `sr-only` hides it from sight but not
            from screen readers; once it has focus, it appears in the top corner, so a sighted
            keyboard user can see where focus is. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:no-underline"
        >
          Skip to content
        </a>
        {/* Outside <Outlet />, so it stays on every page. */}
        <NavBar />
        {/* One <main> for every page, so each page has exactly one, and the skip link always
            has a target. tabIndex -1 lets the link move focus here, without adding a Tab stop.
            The classes: a centred column at most 48rem wide (max-w-3xl), and space-y-4 puts
            1rem between the page's top-level elements, so pages don't set their own margins. */}
        <main id="main" tabIndex={-1} className="mx-auto max-w-3xl space-y-4 px-4 py-8">
          {/* The matched child route (a page) renders here. */}
          <Outlet />
        </main>
        {/* The JavaScript that makes the server-rendered HTML interactive ("hydration"). */}
        <Scripts />
      </body>
    </html>
  )
}
