import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

// jsdom has no matchMedia, so each test plays the system setting with this stand-in.
function systemIs(scheme: 'light' | 'dark') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' && scheme === 'dark',
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('ThemeToggle', () => {
  it("shows the system's theme before anything is chosen, in a group of two radio buttons", () => {
    systemIs('dark')
    render(<ThemeToggle />)

    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked()
    // Nothing is chosen yet, so the page keeps following the system.
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })

  it('switches the page to the theme that is clicked, and remembers it', async () => {
    systemIs('light')
    // user-event acts like a person: a click is pointer down, focus, pointer up, click.
    // (fireEvent.click only sends the click event itself.)
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('mise-theme')).toBe('dark')

    await user.click(screen.getByRole('radio', { name: 'Light' }))

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('mise-theme')).toBe('light')
  })

  it('stays on the current theme when it is clicked again', async () => {
    systemIs('light')
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'Light' }))

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })
})
