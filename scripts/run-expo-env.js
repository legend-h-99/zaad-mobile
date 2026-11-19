const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const [appEnv, ...expoArgs] = process.argv.slice(2)

if (!appEnv || expoArgs.length === 0) {
  console.error('Usage: node scripts/run-expo-env.js <development|staging|production> <expo args...>')
  process.exit(1)
}

const rootDir = path.join(__dirname, '..')
const envPath = findEnvFile(appEnv)
const fileEnv = envPath ? readEnvFile(envPath) : {}
const buildEnv = { ...fileEnv, ...process.env, APP_ENV: appEnv, EXPO_NO_DOTENV: '1' }
validateEnvironment(appEnv, buildEnv)
const expoBin = path.join(rootDir, 'node_modules', '.bin', 'expo')

const result = spawnSync(expoBin, expoArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...buildEnv,
    APP_ENV: appEnv,
    EXPO_NO_DOTENV: '1',
  },
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)

function findEnvFile(appEnv) {
  const candidates = [
    `.env.${appEnv}.local`,
    `.env.${appEnv}`,
    appEnv === 'development' ? '.env.local' : '',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const candidatePath = path.join(rootDir, candidate)
    if (fs.existsSync(candidatePath)) {
      console.log(`Using ${candidate} for ${appEnv} Expo build.`)
      return candidatePath
    }
  }

  return null
}

function readEnvFile(envPath) {
  const env = {}
  const src = fs.readFileSync(envPath, 'utf8')

  for (const line of src.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function validateEnvironment(mode, env) {
  if (!['development', 'staging', 'production'].includes(mode)) throw new Error('Invalid APP_ENV')
  if (mode === 'development') return
  for (const key of ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_SUPABASE_URL']) {
    let url
    try { url = new URL(env[key]) } catch { throw new Error(`${key} must be a remote HTTPS URL`) }
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
      || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')
      || host === '[::1]' || host.includes(':') || /^\d+\.\d+\.\d+\.\d+$/.test(host)
      || host.endsWith('.example') || host.endsWith('.invalid')) {
      throw new Error(`${key} must be a remote HTTPS URL`)
    }
  }
  if (!env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required')
}
