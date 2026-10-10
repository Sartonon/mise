import { afterEach, describe, expect, it, vi } from 'vitest'
import { getServerInfo } from './server-info.server'

describe('getServerInfo', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reports the given time as an ISO string', () => {
    const info = getServerInfo(new Date(Date.UTC(2026, 9, 10, 12, 30)))

    expect(info.time).toBe('2026-10-10T12:30:00.000Z')
  })

  it('reports the Node.js version it runs on', () => {
    expect(getServerInfo().nodeVersion).toBe(process.version)
  })

  it('reports the Vercel region, or "local" outside Vercel', () => {
    vi.stubEnv('VERCEL_REGION', 'fra1')
    expect(getServerInfo().region).toBe('fra1')

    vi.stubEnv('VERCEL_REGION', undefined)
    expect(getServerInfo().region).toBe('local')
  })
})
