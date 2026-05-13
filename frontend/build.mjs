import { webcrypto } from 'crypto'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

// Polyfill crypto para este processo e todos os filhos
globalThis.crypto = webcrypto
const polyfillPath = resolve(dirname(fileURLToPath(import.meta.url)), 'crypto-polyfill.cjs')
process.env.NODE_OPTIONS = `--require ${polyfillPath}`

execSync('npx tsc --noEmit', { stdio: 'inherit' })
execSync('npx vite build', { stdio: 'inherit' })
