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

// --- Relocate @expo/vector-icons fonts out of any `node_modules` directory. ---
// Expo exports vendored icon fonts under `dist/assets/node_modules/...`. Static
// hosts (GitHub Pages/Jekyll, Cloudflare Pages) silently strip any folder named
// `node_modules` from deploys, so every Feather/Ionicons/etc glyph 404s and
// renders as a tofu box (□). We rename that one segment to `vendor` and rewrite
// the string references (they only appear inside the JS bundles).
function relocateIconFonts() {
  const fromDir = path.join(distDir, 'assets', 'node_modules')
  const toDir = path.join(distDir, 'assets', 'vendor')
  if (!fs.existsSync(fromDir)) {
    console.log('No dist/assets/node_modules to relocate (already patched or none emitted).')
    return
  }
  fs.rmSync(toDir, { recursive: true, force: true })
  fs.renameSync(fromDir, toDir)

  const jsDir = path.join(distDir, '_expo', 'static', 'js', 'web')
  let patched = 0
  if (fs.existsSync(jsDir)) {
    for (const file of fs.readdirSync(jsDir)) {
      if (!file.endsWith('.js')) continue
      const p = path.join(jsDir, file)
      const src = fs.readFileSync(p, 'utf8')
      if (src.includes('/assets/node_modules/')) {
        fs.writeFileSync(p, src.split('/assets/node_modules/').join('/assets/vendor/'))
        patched++
      }
    }
  }
  console.log(`Relocated icon fonts: assets/node_modules -> assets/vendor (patched ${patched} JS bundle${patched === 1 ? '' : 's'}).`)
}

relocateIconFonts()

fs.copyFileSync(indexPath, path.join(distDir, '404.html'))
fs.writeFileSync(path.join(distDir, '.nojekyll'), '')
fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200\n')

for (const route of routes) {
  const routeDir = path.join(distDir, route)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'))
}

console.log(`Prepared web SPA routes and Cloudflare Pages fallback: ${routes.join(', ')}`)
