#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { fileURLToPath } from 'node:url'
import databaseTls from './database-tls.cjs'

const { Client } = pg
const connectionString = process.env.SUPABASE_DB_URL
const schemaPath = process.env.SUPABASE_SCHEMA_PATH ?? fileURLToPath(new URL('../../app/src/lib/supabase/schema.sql', import.meta.url))

if (!connectionString) {
  console.error('Missing SUPABASE_DB_URL.')
  process.exit(1)
}

const ca = process.env.SUPABASE_DB_CA_FILE ? await readFile(process.env.SUPABASE_DB_CA_FILE, 'utf8') : undefined
const client = new Client(databaseTls.databaseConnectionOptions(connectionString, {
  ca,
  allowInsecureLocal: process.env.SUPABASE_DB_ALLOW_INSECURE_LOCAL === 'true',
}))

try {
  const sql = await readFile(schemaPath, 'utf8')
  await client.connect()
  await client.query(sql)
  console.log('Schema applied.')
} catch (error) {
  console.error('Failed to apply schema.')
  console.error(error?.message || error)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
