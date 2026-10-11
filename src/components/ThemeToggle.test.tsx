import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('ThemeToggle', () => {
  it('starts on System, as a group of three radio buttons', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
  })

  it('switches the page to the theme that is clicked, and remembers it', async () => {
    // user-event acts like a person: a click is pointer down, focus, pointer up, click.
    // (fireEvent.click only sends the click event itself.)
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('mise-theme')).toBe('dark')

    await user.click(screen.getByRole('radio', { name: 'System' }))

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
    expect(document.documentElement).not.toHaveAttribute('data-theme')
    expect(localStorage.getItem('mise-theme')).toBeNull()
  })

  it('stays on the current theme when it is clicked again', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('radio', { name: 'System' }))

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
  })
})
