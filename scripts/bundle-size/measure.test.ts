import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { chunkName, measureDir } from './measure.ts'

describe('chunkName', () => {
  test('drops the hash Vite adds to file names', () => {
    expect(chunkName('index-C81CQBgb.js')).toBe('index.js')
    expect(chunkName('app-T9gVEIdW.css')).toBe('app.css')
  })

  test('keeps dashes that are part of the name, and hashes that contain a dash', () => {
    expect(chunkName('use-theme-a_B-cD3e.js')).toBe('use-theme.js')
  })

  test('leaves names without a hash alone', () => {
    expect(chunkName('favicon.svg')).toBe('favicon.svg')
  })
})

describe('measureDir', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'bundle-size-'))
    await mkdir(join(dir, 'assets'))
  })
  afterEach(async () => {
    await rm(dir, { recursive: true })
  })

  test('measures .js and .css files, biggest first, and skips everything else', async () => {
    await writeFile(join(dir, 'assets', 'index-C81CQBgb.js'), 'const x = 1;'.repeat(100))
    await writeFile(join(dir, 'assets', 'app-T9gVEIdW.css'), 'a{}')
    await writeFile(join(dir, 'favicon.svg'), '<svg/>')

    const assets = await measureDir(dir)

    expect(assets.map((asset) => [asset.name, asset.kind, asset.raw])).toEqual([
      ['index.js', 'js', 1200],
      ['app.css', 'css', 3],
    ])
    // Repeated code compresses well.
    expect(assets[0]?.compressed).toBeLessThan(100)
  })

  test('numbers chunks that end up with the same name', async () => {
    await writeFile(join(dir, 'assets', 'index-AAAAAAAA.js'), 'a')
    await writeFile(join(dir, 'assets', 'index-BBBBBBBB.js'), 'b')

    const names = (await measureDir(dir)).map((asset) => asset.name).sort()

    expect(names).toEqual(['index.js', 'index.js (2)'])
  })
})
