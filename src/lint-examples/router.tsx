// @tanstack/eslint-plugin-router: both routes break one rule.
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '~/routes/__root'

// @tanstack/router/create-route-property-order (a warning, fixable with --fix):
// `loader` comes before `beforeLoad`. Types flow from earlier options to later ones,
// so in the wrong order `loader` can't see what `beforeLoad` adds to the context.
export const wrongOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lint-example',
  loader: ({ context }) => context,
  beforeLoad: () => ({ user: 'example' }),
})

// @tanstack/router/route-param-names: `$1st` isn't a valid param name,
// because a name must be a valid JavaScript identifier (it becomes `params.xxx`).
export const badParamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recipes/$1st',
})
