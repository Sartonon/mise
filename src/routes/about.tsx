import { createFileRoute } from '@tanstack/react-router'

// routes/about.tsx is the "/about" URL.
export const Route = createFileRoute('/about')({
  // A child route's `head` is merged with the root's, and its title wins.
  head: () => ({ meta: [{ title: 'About · Mise' }] }),
  component: About,
})

function About() {
  return (
    <main>
      <h1>About</h1>
      <p>Mise is a recipe and meal planner, built to learn TanStack Start one step at a time.</p>
    </main>
  )
}
