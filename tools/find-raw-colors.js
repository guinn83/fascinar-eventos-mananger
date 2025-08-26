import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'src')

// Regex to find hardcoded Tailwind color utilities that include numeric scales or explicit opacity.
// We intentionally avoid matching semantic token names like `text-success`, `text-primary`, `text-danger`.
const regex = /\b(?:text|bg|border|from|to|via)-(?:slate|gray|white|black|blue|green|red|yellow|indigo|purple|pink|sky|emerald|amber)(?:-[0-9]{1,3}|(?:\/\d{1,3}))\b|bg-\w+\/\d{1,3}|bg-gradient-to-[lrtb]|text-[0-9]{3}/g

const results = []

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (f === 'node_modules' || f === '.git') continue
      // Skip the UI primitives and types directory (these are the canonical token definitions)
      if (full.includes(path.join('src', 'components', 'ui')) || full.includes(path.join('src', 'types'))) continue
      walk(full)
      continue
    }
    if (!full.endsWith('.tsx') && !full.endsWith('.ts') && !full.endsWith('.jsx') && !full.endsWith('.js')) continue

    const content = fs.readFileSync(full, 'utf8')
    const matches = content.match(regex)
    if (matches && matches.length > 0) {
      // Skip files that are intentionally allowed to contain token definitions
      const rel = path.relative(root, full)
      if (rel.startsWith('src/components/ui') || rel.startsWith('src/types')) return
      results.push({ file: rel, matches: Array.from(new Set(matches)) })
    }
  }
}

walk(src)

if (results.length === 0) {
  console.log('No raw color utilities found.')
  process.exit(0)
}

for (const r of results) {
  console.log(r.file)
  console.log('  ', r.matches.join(', '))
}
console.log('\nTotal files with matches:', results.length)
console.error('\nERROR: Found raw Tailwind color utilities. Please replace with theme tokens or justify in PR.')
process.exit(1)
