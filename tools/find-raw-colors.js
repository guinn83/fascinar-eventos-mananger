import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'src')

// Regex to find common hardcoded Tailwind color utilities and gradients
const regex = /\b(text|bg|from|to|via|border)-(?:slate|gray|white|black|blue|green|red|yellow|indigo|purple|pink|sky|emerald|amber|danger|success|info|primary|secondary)(?:-[0-9]{1,3}|(?:\/\d{1,3})?)?\b|bg-gradient-to-[lrtb]|bg-\w+\/[0-9]{1,3}|text-[0-9]{3}/g

const results = []

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (f === 'node_modules' || f === '.git') continue
      walk(full)
      continue
    }
    if (!full.endsWith('.tsx') && !full.endsWith('.ts') && !full.endsWith('.jsx') && !full.endsWith('.js')) continue

    const content = fs.readFileSync(full, 'utf8')
    const matches = content.match(regex)
    if (matches && matches.length > 0) {
      results.push({ file: path.relative(root, full), matches: Array.from(new Set(matches)) })
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
