#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import pg from 'pg'

const { Client } = pg
const connectionString = process.env.SUPABASE_DB_URL
const schemaPath = '/Users/hossam/Documents/zaad/app/src/lib/supabase/schema.sql'

if (!connectionString) {
  console.error('Missing SUPABASE_DB_URL.')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
})

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
