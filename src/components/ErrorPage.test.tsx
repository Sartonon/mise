import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'

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
})
