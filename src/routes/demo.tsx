// DEMO, do not merge: the page that shows ChecksDemo, so the e2e tests can scan it.
import { createFileRoute, notFound } from '@tanstack/react-router'
import { ChecksDemo } from '~/components/ChecksDemo'

export const Route = createFileRoute('/demo')({
  // Allowed on purpose: `only-throw-error` accepts TanStack's notFound() (see eslint.config.js),
  // so this line passes lint while the `throw 'No recipes'` in ChecksDemo fails it.
  loader: () => {
    const recipes = ['Tomato soup', 'Pancakes']
    if (recipes.length === 0) throw notFound()
    return recipes
  },
  head: () => ({ meta: [{ title: 'Checks demo · Mise' }] }),
  component: Demo,
})

function Demo() {
  return <ChecksDemo recipes={Route.useLoaderData()} />
}
