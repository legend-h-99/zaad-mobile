const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distDir, 'index.html')

const routes = [
  'login',
  'register',
  'reset-password',
  'profile',
  'onboarding',
  'goals',
  'diet',
  'schedule',
  'notifications',
  'family',
  'consultation',
  'privacy',
]

if (!fs.existsSync(indexPath)) {
  throw new Error(`Missing ${indexPath}. Run expo export before preparing GitHub Pages routes.`)
}

fs.copyFileSync(indexPath, path.join(distDir, '404.html'))
fs.writeFileSync(path.join(distDir, '.nojekyll'), '')

for (const route of routes) {
  const routeDir = path.join(distDir, route)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'))
}

console.log(`Prepared GitHub Pages SPA routes: ${routes.join(', ')}`)
