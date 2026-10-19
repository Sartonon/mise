import { render, screen, within } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

// The header's links need a router. This is a tiny one with the same two pages as the app,
// in memory (no real URL bar), starting at `path`.
function renderAt(path: string) {
  const root = createRootRoute({
    component: () => (
      <>
        <Header />
        <Outlet />
      </>
    ),
  })
  const routeTree = root.addChildren([
    createRoute({ getParentRoute: () => root, path: '/' }),
    createRoute({ getParentRoute: () => root, path: '/about' }),
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(<RouterProvider router={router} />)
}

// jsdom has no matchMedia, which the theme toggle asks for the system setting.
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Header', () => {
  it('has the wordmark linking home, the main nav and the theme toggle', async () => {
    renderAt('/about')

    const banner = await screen.findByRole('banner')
    expect(within(banner).getByRole('link', { name: 'mise' })).toHaveAttribute('href', '/')
    const nav = within(banner).getByRole('navigation', { name: 'Main' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Home', 'About'])
    expect(within(banner).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
  })

  it('marks only the current page in the nav, by more than colour', async () => {
    renderAt('/about')

    const nav = await screen.findByRole('navigation', { name: 'Main' })
    const about = within(nav).getByRole('link', { name: 'About' })
    expect(about).toHaveAttribute('aria-current', 'page')
    // The filled pill is backed up by bold text (DESIGN.md: state never by colour alone).
    expect(about).toHaveClass('aria-[current=page]:font-bold')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})
