import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { NavBar } from '~/components/NavBar'
import { NotFound } from '~/components/NotFound'

// The root route wraps every page. Because Start renders on the server,
// it owns the whole HTML document, not just a <div id="root">.
export const Route = createRootRoute({
  // Tags for <head>. Child routes can add their own (for example a page title).
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Mise' },
    ],
  }),
  component: RootDocument,
  // Rendered inside RootDocument in place of the page, so the nav bar stays.
  // Without it, the router warns and shows a bare <p>Not Found</p>.
  notFoundComponent: NotFound,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        {/* Renders the tags from `head` above. */}
        <HeadContent />
      </head>
      <body>
        {/* Outside <Outlet />, so it stays on every page. */}
        <NavBar />
        {/* The matched child route (a page) renders here. */}
        <Outlet />
        {/* The JavaScript that makes the server-rendered HTML interactive ("hydration"). */}
        <Scripts />
      </body>
    </html>
  )
}
