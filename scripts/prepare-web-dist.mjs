import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

const distDir = new URL('../dist/', import.meta.url).pathname

copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'))

for (const entry of readdirSync(distDir)) {
  const source = join(distDir, entry)
  if (!statSync(source).isFile() || extname(entry) !== '.html') continue
  if (entry === 'index.html' || entry === '404.html' || entry.startsWith('_') || entry.startsWith('+')) continue

  const routeName = basename(entry, '.html')
  const routeDir = join(distDir, routeName)
  mkdirSync(routeDir, { recursive: true })
  copyFileSync(source, join(routeDir, 'index.html'))
}
