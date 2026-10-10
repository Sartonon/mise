import { Link } from '@tanstack/react-router'

export function NavBar() {
  return (
    // <nav> is a "navigation" landmark: screen readers (and tests) can find it by role.
    <nav aria-label="Main">
      {/* `to` is checked against the route tree: a path that doesn't exist is a type error.
          Clicking a <Link> changes the page in the browser, without reloading it.
          On the current page's link, Link adds aria-current="page" and data-status="active".
          `exact` stops "/" from counting as active on every page (all paths start with "/").
          At least 24px high: WCAG 2.2 asks for touch targets that big (or that far apart),
          so a finger can hit the right one. Step 20 replaces these styles with Tailwind. */}
      <Link to="/" activeOptions={{ exact: true }} style={touchTarget}>
        Home
      </Link>{' '}
      <Link to="/about" style={touchTarget}>
        About
      </Link>
    </nav>
  )
}

const touchTarget = { display: 'inline-block', minHeight: 24 }
