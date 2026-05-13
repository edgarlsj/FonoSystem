import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

// Polyfill crypto apenas no Node 18 (no Node 20+ já é global e read-only)
try {
  const { webcrypto } = await import('crypto')
  globalThis.crypto = webcrypto
} catch {
  // Node 20+: crypto já disponível globalmente, sem necessidade de polyfill
}

const polyfillPath = resolve(dirname(fileURLToPath(import.meta.url)), 'crypto-polyfill.cjs')
process.env.NODE_OPTIONS = `--require ${polyfillPath}`

execSync('npx tsc --noEmit', { stdio: 'inherit' })
execSync('npx vite build', { stdio: 'inherit' })
