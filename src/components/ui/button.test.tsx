import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '~/components/ui/button'

describe('Button', () => {
  it('renders a button with its text as the accessible name', () => {
    render(<Button>Save recipe</Button>)
    expect(screen.getByRole('button', { name: 'Save recipe' })).toHaveAttribute(
      'data-variant',
      'default',
    )
  })

  it("lets the caller's class win over a conflicting one", () => {
    render(<Button className="px-8">Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveClass('px-8')
    expect(button).not.toHaveClass('px-4')
  })

  it("uses the size's text size instead of the shared one", () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveClass('h-11', 'text-base')
    expect(button).not.toHaveClass('text-sm')
  })

  it('is disabled with isDisabled', () => {
    render(<Button isDisabled>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
