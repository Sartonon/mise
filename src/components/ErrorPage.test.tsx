import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  HeadContent,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage, RouteErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('says what happened in its heading', () => {
    render(<ErrorPage onRetry={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeVisible()
  })

  it('calls onRetry when Try again is pressed', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorPage onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('keeps focus on a control outside the replaced page', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <>
        <button>Theme</button>
      </>,
    )
    await user.tab()

    rerender(
      <>
        <button>Theme</button>
        <ErrorPage onRetry={() => {}} />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Theme' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).not.toHaveFocus()
  })

  it('announces a render error and restores the page title and focus after retry', async () => {
    const user = userEvent.setup()
    let shouldFail = true
    // React reports the deliberately thrown error even though the router catches it.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = createRootRoute({
      component: () => (
        <>
          <HeadContent />
          <main id="main">
            <Outlet />
          </main>
        </>
      ),
    })
    const page = createRoute({
      getParentRoute: () => root,
      path: '/',
      head: () => ({ meta: [{ title: 'Normal page · Mise' }] }),
      component: () => {
        if (shouldFail) throw new Error('Deliberate render failure')
        return <h1>Recovered page</h1>
      },
    })
    const router = createRouter({
      routeTree: root.addChildren([page]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
      defaultErrorComponent: RouteErrorPage,
    })

    try {
      render(<RouterProvider router={router} />)
      expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toHaveFocus()
      expect(document.title).toBe('Something went wrong · Mise')

      shouldFail = false
      await user.click(screen.getByRole('button', { name: 'Try again' }))
      expect(await screen.findByRole('heading', { name: 'Recovered page' })).toBeVisible()
      await vi.waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Recovered page' })).toHaveFocus()
        expect(document.title).toBe('Normal page · Mise')
      })
    } finally {
      vi.restoreAllMocks()
    }
  })
})
