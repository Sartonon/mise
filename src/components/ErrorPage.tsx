import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { focusPageHeading } from '~/lib/useFocusHeadingOnNavigate'

// Shown in place of a page when its loader or its component throws, for example when the
// server can't be reached. Like NotFound, it renders inside the layout, so the nav bar stays.
// It doesn't show the error itself: that's for the console, not for the people using the app.
export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The error page sets its own title, the one place that does: a component that throws
    // while rendering is caught by React, so the router (and the root route's `head`) never
    // learns about it. Restore the old title when the error page goes.
    const previousTitle = document.title
    const errorTitle = 'Something went wrong · Mise'
    document.title = errorTitle
    // When the error page replaces the page that had focus, focus falls to <body>. Then move it
    // to this heading. If focus is somewhere else, like the header, leave it there.
    if (document.activeElement === document.body) headingRef.current?.focus({ preventScroll: true })
    return () => {
      // A navigation may already have set the next page's title.
      if (document.title === errorTitle) document.title = previousTitle
      // This runs after React has put the next content in the page. If Try again worked, the
      // button that had focus is gone, so move focus to the recovered page's heading. After a
      // link click, focus is on the link, and the navigation moves it instead.
      if (document.activeElement === document.body) focusPageHeading()
    }
  }, [])

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Something went wrong
      </h1>
      <p>This page couldn't be loaded. Try again, or come back in a moment.</p>
      <Button onPress={onRetry}>Try again</Button>
    </>
  )
}

// The router's version (see src/router.tsx). ErrorPage stays a plain component, so a test
// can render it without a router.
export function RouteErrorPage() {
  const router = useRouter()
  // invalidate() runs the loaders again and clears the error, so the page gets a second try.
  return <ErrorPage onRetry={() => void router.invalidate()} />
}
