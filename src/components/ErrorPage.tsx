import { useRouter } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'

// Shown in place of a page when its loader or its component throws, for example when the
// server can't be reached. Like NotFound, it renders inside the layout, so the nav bar stays.
// It doesn't show the error itself: that's for the console, not for the people using the app.
export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <h1>Something went wrong</h1>
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
