import { describe, expect, it } from 'vitest'
import { parseTheme } from './theme'

describe('parseTheme', () => {
  it('keeps a saved choice of light or dark', () => {
    expect(parseTheme('light')).toBe('light')
    expect(parseTheme('dark')).toBe('dark')
  })

  // localStorage can hold anything (an old version's value, or one typed in devtools),
  // so anything we don't know means "no choice yet": follow the system.
  it('gives null for nothing saved or an unknown value', () => {
    expect(parseTheme(null)).toBeNull()
    expect(parseTheme('system')).toBeNull()
  })
})
