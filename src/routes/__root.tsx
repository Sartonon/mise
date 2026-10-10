import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

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
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        {/* Renders the tags from `head` above. */}
        <HeadContent />
      </head>
      <body>
        {/* The matched child route (a page) renders here. */}
        <Outlet />
        {/* The JavaScript that makes the server-rendered HTML interactive ("hydration"). */}
        <Scripts />
      </body>
    </html>
  )
}
