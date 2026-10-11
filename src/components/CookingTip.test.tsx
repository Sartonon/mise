import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CookingTip, tips } from './CookingTip'

describe('CookingTip', () => {
  it('shows no tip until the button is pressed', () => {
    render(<CookingTip />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('shows the next tip each time the button is pressed, starting over after the last', () => {
    render(<CookingTip />)
    const button = screen.getByRole('button', { name: 'Show a cooking tip' })

    for (const tip of tips) {
      fireEvent.click(button)
      expect(screen.getByRole('status')).toHaveTextContent(tip)
    }

    fireEvent.click(button)
    expect(screen.getByRole('status')).toHaveTextContent(tips[0])
  })
})
