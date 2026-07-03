#!/usr/bin/env node
/**
 * Genera las API keys (JWT HS256) compatibles con supabase-js a partir del JWT_SECRET.
 * Uso:  node scripts/gen-keys.mjs "<JWT_SECRET>"
 * Sin dependencias: usa el modulo crypto de Node.
 */
import crypto from 'node:crypto'

const secret = process.argv[2] || process.env.JWT_SECRET
if (!secret || secret.length < 32) {
  console.error('Falta JWT_SECRET (minimo 32 caracteres).')
  console.error('Uso: node scripts/gen-keys.mjs "<JWT_SECRET>"')
  process.exit(1)
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

function sign(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`
  const sig = b64url(crypto.createHmac('sha256', secret).update(data).digest())
  return `${data}.${sig}`
}

const iat = Math.floor(Date.now() / 1000)
const exp = iat + 60 * 60 * 24 * 365 * 10 // 10 anios

const anon = sign({ role: 'anon', iss: 'supabase', iat, exp })
const service = sign({ role: 'service_role', iss: 'supabase', iat, exp })

console.log('\n# Pega estas variables en .env y en Vercel:\n')
console.log(`ANON_KEY=${anon}`)
console.log(`SERVICE_ROLE_KEY=${service}`)
console.log('\n# En Vercel:')
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY=${service}`)
