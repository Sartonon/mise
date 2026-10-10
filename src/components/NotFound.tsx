import { Link } from '@tanstack/react-router'

// Shown for any URL that matches no route (and for `notFound()` thrown by a loader, later).
export function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>There is no page at this address.</p>
      <Link to="/">Go to the home page</Link>
    </main>
  )
}
