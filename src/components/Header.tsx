import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '~/components/ThemeToggle'

export function Header() {
  return (
    // A <header> that isn't inside an <article> or <section> is the page's "banner" landmark:
    // screen readers can jump to it, like to <nav> and <main>.
    <header className="border-b border-border">
      {/* The same centred column as <main> (see __root.tsx), so the links line up with the page.
          justify-between pushes the theme toggle to the right edge. */}
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-2">
        {/* <nav> is a "navigation" landmark: screen readers (and tests) can find it by role. */}
        <nav aria-label="Main" className="flex gap-6">
          {/* `to` is checked against the route tree: a path that doesn't exist is a type error.
              Clicking a <Link> changes the page in the browser, without reloading it.
              On the current page's link, Link adds aria-current="page" and data-status="active".
              `exact` stops "/" from counting as active on every page (all paths start with "/").
              min-h-6: at least 24px high, because WCAG 2.2 asks for touch targets that big (or
              that far apart), so a finger can hit the right one.
              aria-[current=page]:...: styles for the current page's link, picked by the same
              attribute screen readers read. It gets an underline as well as the colour, so it
              doesn't rely on colour alone. */}
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="inline-flex min-h-6 items-center font-medium text-foreground no-underline hover:text-primary aria-[current=page]:text-primary aria-[current=page]:underline"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="inline-flex min-h-6 items-center font-medium text-foreground no-underline hover:text-primary aria-[current=page]:text-primary aria-[current=page]:underline"
          >
            About
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
