import type { ReactNode } from 'react'

// A plain React component: it knows nothing about routes, so a test can render it on its own.
// `children` lets the page put extra content under the greeting.
export function Welcome({ children }: { children?: ReactNode }) {
  return (
    <>
      <h1>Hello, Mise</h1>
      <p className="text-lg text-muted-foreground">
        Recipes and meal planning, built one small step at a time.
      </p>
      {children}
    </>
  )
}
