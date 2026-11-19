import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'

const repoRoot = path.join(__dirname, '..')

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zaad-script-test-'))
}

function copyScript(tempRoot: string, scriptName: string) {
  const scriptsDir = path.join(tempRoot, 'scripts')
  fs.mkdirSync(scriptsDir, { recursive: true })
  fs.copyFileSync(
    path.join(repoRoot, 'scripts', scriptName),
    path.join(scriptsDir, scriptName),
  )
}

describe('scripts/run-expo-env.js', () => {
  it('loads the staging env file and prevents Expo from loading .env.local', () => {
    const tempRoot = makeTempRepo()
    copyScript(tempRoot, 'run-expo-env.js')

    fs.writeFileSync(
      path.join(tempRoot, '.env.local'),
      'APP_ENV=development\nEXPO_PUBLIC_API_URL=http://localhost:3000\n',
    )
    fs.writeFileSync(
      path.join(tempRoot, '.env.staging.local'),
      [
        'APP_ENV=staging',
        'EXPO_PUBLIC_API_URL=https://api-staging.zaadk.app',
        'EXPO_PUBLIC_SUPABASE_URL=https://staging.supabase.co',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY=synthetic-test-key',
        'QUOTED_VALUE="quoted staging value"',
        '',
      ].join('\n'),
    )

    const binDir = path.join(tempRoot, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    fs.writeFileSync(
      path.join(binDir, 'expo'),
      [
        '#!/usr/bin/env node',
        "const fs = require('fs')",
        "const path = require('path')",
        'fs.writeFileSync(',
        "  path.join(process.cwd(), 'expo-env-capture.json'),",
        '  JSON.stringify({',
        '    argv: process.argv.slice(2),',
        '    APP_ENV: process.env.APP_ENV,',
        '    EXPO_NO_DOTENV: process.env.EXPO_NO_DOTENV,',
        '    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,',
        '    QUOTED_VALUE: process.env.QUOTED_VALUE,',
        '  })',
        ')',
        '',
      ].join('\n'),
      { mode: 0o755 },
    )

    const output = execFileSync(
      process.execPath,
      ['scripts/run-expo-env.js', 'staging', 'export', '--clear'],
      { cwd: tempRoot, encoding: 'utf8' },
    )
    const captured = JSON.parse(
      fs.readFileSync(path.join(tempRoot, 'expo-env-capture.json'), 'utf8'),
    )

    expect(output).toContain('Using .env.staging.local for staging Expo build.')
    expect(captured).toEqual({
      argv: ['export', '--clear'],
      APP_ENV: 'staging',
      EXPO_NO_DOTENV: '1',
      EXPO_PUBLIC_API_URL: 'https://api-staging.zaadk.app',
      QUOTED_VALUE: 'quoted staging value',
    })
  })

  it('falls back to .env.local for development only', () => {
    const tempRoot = makeTempRepo()
    copyScript(tempRoot, 'run-expo-env.js')

    fs.writeFileSync(
      path.join(tempRoot, '.env.local'),
      'EXPO_PUBLIC_API_URL=http://localhost:3000\n',
    )

    const binDir = path.join(tempRoot, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    fs.writeFileSync(path.join(binDir, 'expo'), '#!/usr/bin/env node\n', { mode: 0o755 })

    const output = execFileSync(
      process.execPath,
      ['scripts/run-expo-env.js', 'development', 'export'],
      { cwd: tempRoot, encoding: 'utf8' },
    )

    expect(output).toContain('Using .env.local for development Expo build.')
  })
})

describe('scripts/prepare-gh-pages-routes.js', () => {
  it('relocates icon fonts and prepares static SPA fallback routes', () => {
    const tempRoot = makeTempRepo()
    copyScript(tempRoot, 'prepare-gh-pages-routes.js')

    const distDir = path.join(tempRoot, 'dist')
    const jsDir = path.join(distDir, '_expo', 'static', 'js', 'web')
    const fontDir = path.join(
      distDir,
      'assets',
      'node_modules',
      '@expo',
      'vector-icons',
      'build',
      'vendor',
      'react-native-vector-icons',
      'Fonts',
    )
    fs.mkdirSync(jsDir, { recursive: true })
    fs.mkdirSync(fontDir, { recursive: true })
    fs.writeFileSync(path.join(distDir, 'index.html'), '<div id="root"></div>')
    fs.writeFileSync(path.join(fontDir, 'Feather.hash.ttf'), 'font-bytes')
    fs.writeFileSync(
      path.join(jsDir, 'index.js'),
      'module.exports="/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.hash.ttf"',
    )
    fs.writeFileSync(path.join(jsDir, 'ignored.txt'), '/assets/node_modules/unchanged')

    const output = execFileSync(process.execPath, ['scripts/prepare-gh-pages-routes.js'], {
      cwd: tempRoot,
      encoding: 'utf8',
    })

    const patchedBundle = fs.readFileSync(path.join(jsDir, 'index.js'), 'utf8')
    expect(output).toContain('Relocated icon fonts: assets/node_modules -> assets/vendor')
    expect(fs.existsSync(path.join(distDir, 'assets', 'node_modules'))).toBe(false)
    expect(
      fs.existsSync(
        path.join(
          distDir,
          'assets',
          'vendor',
          '@expo',
          'vector-icons',
          'build',
          'vendor',
          'react-native-vector-icons',
          'Fonts',
          'Feather.hash.ttf',
        ),
      ),
    ).toBe(true)
    expect(patchedBundle).toContain('/assets/vendor/@expo/vector-icons')
    expect(patchedBundle).not.toContain('/assets/node_modules/')
    expect(fs.readFileSync(path.join(distDir, '_redirects'), 'utf8')).toBe(
      '/* /index.html 200\n',
    )
    expect(fs.existsSync(path.join(distDir, '.nojekyll'))).toBe(true)
    expect(fs.readFileSync(path.join(distDir, '404.html'), 'utf8')).toBe('<div id="root"></div>')
    expect(fs.readFileSync(path.join(distDir, 'register', 'index.html'), 'utf8')).toBe(
      '<div id="root"></div>',
    )
  })
})
