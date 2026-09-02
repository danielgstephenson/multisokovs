import { cp, rm } from 'node:fs/promises'

const SRC = new URL('../web/', import.meta.url)
const DEST = new URL('../public/', import.meta.url)

await rm(DEST, { recursive: true, force: true })
await cp(SRC, DEST, {
  recursive: true,
  filter: src => !src.endsWith('.ts') && !src.endsWith('tsconfig.json'),
})
