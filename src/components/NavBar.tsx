import { Link } from '@tanstack/react-router'

export function NavBar() {
  return (
    // <nav> is a "navigation" landmark: screen readers (and tests) can find it by role.
    <nav aria-label="Main">
      {/* `to` is checked against the route tree: a path that doesn't exist is a type error.
          Clicking a <Link> changes the page in the browser, without reloading it.
          On the current page's link, Link adds aria-current="page" and data-status="active".
          `exact` stops "/" from counting as active on every page (all paths start with "/"). */}
      <Link to="/" activeOptions={{ exact: true }}>
        Home
      </Link>{' '}
      <Link to="/about">About</Link>
    </nav>
  )
}
