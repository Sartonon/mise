import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { brotliCompressSync } from 'node:zlib'

// One file the browser downloads: its size as it is on disk (`raw`, what the browser has
// to parse) and compressed with Brotli (`compressed`, what goes over the network: Vercel
// sends .js and .css files Brotli-compressed to every browser that accepts it).
export type Asset = {
  name: string
  kind: 'js' | 'css'
  raw: number
  compressed: number
}

// Vite adds a hash of the contents to every file name (`index-C81CQBgb.js`), so that
// browsers can cache it forever. The hash changes whenever the code does, so to match
// a file on `main` with the same file in a pull request, we compare names without it.
export function chunkName(fileName: string): string {
  return fileName.replace(/-[\w-]{8}(?=\.[a-z]+$)/, '')
}

function kindOf(fileName: string): Asset['kind'] | undefined {
  if (fileName.endsWith('.js')) return 'js'
  if (fileName.endsWith('.css')) return 'css'
  return undefined
}

// Every .js and .css file under `dir` (the build's `.output/public`), biggest first.
// Other files (favicon, images) aren't part of the bundle, so they're left out.
export async function measureDir(dir: string): Promise<Asset[]> {
  const files = await readdir(dir, { recursive: true })
  const assets: Asset[] = []
  for (const file of files.sort()) {
    const kind = kindOf(file)
    if (!kind) continue
    const contents = await readFile(join(dir, file))
    // Just the file name (`assets/index-C81CQBgb.js` → `index.js`): every chunk is in `assets/`.
    const base = chunkName(basename(file))
    // Two chunks can share a name (say, two `index` files); number the second one.
    let name = base
    for (let n = 2; assets.some((asset) => asset.name === name); n++) {
      name = `${base} (${n})`
    }
    assets.push({
      name,
      kind,
      raw: contents.byteLength,
      compressed: brotliCompressSync(contents).byteLength,
    })
  }
  return assets.sort((a, b) => b.compressed - a.compressed)
}
