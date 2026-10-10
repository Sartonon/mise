import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServerInfoNote } from './ServerInfoNote'

describe('ServerInfoNote', () => {
  it('shows the time, Node.js version and region it was given', () => {
    render(
      <ServerInfoNote
        info={{ time: '2026-10-10T12:30:00.000Z', nodeVersion: 'v24.0.0', region: 'fra1' }}
      />,
    )

    expect(screen.getByText('2026-10-10T12:30:00.000Z')).toHaveAttribute(
      'datetime',
      '2026-10-10T12:30:00.000Z',
    )
    expect(screen.getByText(/Node\.js v24\.0\.0 \(region: fra1\)/)).toBeInTheDocument()
  })
})
