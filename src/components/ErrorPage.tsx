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
    // Render errors stay inside React's boundary, so the router's match status and head
    // don't change. Give those errors a title too, and restore it when the fallback leaves.
    const previousTitle = document.title
    const errorTitle = 'Something went wrong · Mise'
    document.title = errorTitle
    // A removed page heading loses focus to body. Keep focus elsewhere, such as the header.
    if (document.activeElement === document.body) headingRef.current?.focus({ preventScroll: true })
    return () => {
      // A navigation may already have supplied the next page's title.
      if (document.title === errorTitle && previousTitle !== errorTitle) {
        document.title = previousTitle
      }
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
  async function retry() {
    // Wait for the loaders, then for React to replace the fallback. Its retry button has
    // disappeared, so move lost focus to the recovered page instead of leaving it on body.
    await router.invalidate()
    requestAnimationFrame(() => {
      if (document.activeElement === document.body) focusPageHeading()
    })
  }
  return <ErrorPage onRetry={() => void retry()} />
}
