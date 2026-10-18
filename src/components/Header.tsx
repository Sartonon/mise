import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '~/components/ThemeToggle'

// The nav items are pills (DESIGN.md): fully rounded, 44px high, so they're easy to hit with a
// finger. aria-[current=page]:...: styles for the current page's link, picked by the same
// attribute screen readers read (Link adds aria-current="page" to it). It's filled and bold, so
// it doesn't rely on colour alone.
const navItem =
  'inline-flex h-11 items-center rounded-full px-4 font-medium text-foreground no-underline transition-colors hover:bg-secondary hover:text-secondary-foreground motion-reduce:transition-none aria-[current=page]:bg-secondary aria-[current=page]:font-bold aria-[current=page]:text-secondary-foreground'

export function Header() {
  return (
    // A <header> that isn't inside an <article> or <section> is the page's "banner" landmark:
    // screen readers can jump to it, like to <nav> and <main>.
    // px-4 pt-4: the bar floats, with space around it, instead of touching the window's edges.
    <header className="px-4 pt-4">
      {/* One rounded "pill" bar on the card colour. The same width as <main> (see __root.tsx),
          so it lines up with the page. flex-wrap lets the toggle drop to a second row on a narrow
          phone instead of making the page scroll sideways (WCAG 1.4.10, reflow); rounded-4xl,
          not rounded-full, so the bar still looks right when it's two rows high. */}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 rounded-4xl border border-border bg-card px-3 py-2">
        {/* The lowercase wordmark, in the display font and the brand colour. A link home, as
            people expect from a site's name. Its name, "mise", is the text you see.
            rounded-full: the focus outline follows the element's corners, so it's a pill too. */}
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-full px-3 font-display text-xl font-bold tracking-[-0.02em] text-primary no-underline"
        >
          mise
        </Link>
        {/* <nav> is a "navigation" landmark: screen readers (and tests) can find it by role.
            mr-auto pushes the theme toggle to the right end of the bar. */}
        <nav aria-label="Main" className="mr-auto flex gap-1">
          {/* `to` is checked against the route tree: a path that doesn't exist is a type error.
              Clicking a <Link> changes the page in the browser, without reloading it.
              `exact` stops "/" from counting as active on every page (all paths start with "/"). */}
          <Link to="/" activeOptions={{ exact: true }} className={navItem}>
            Home
          </Link>
          <Link to="/about" className={navItem}>
            About
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
