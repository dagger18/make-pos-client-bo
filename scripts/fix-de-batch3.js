const fs = require('fs')
let content = fs.readFileSync('src/locales/de_batch3.translations.json', 'utf8')

// Fix: lines with German opening quote „ (U+201E) may have an unescaped ASCII " (U+22) as closing quote
// Replace: „content" -> „content" (U+201D right double quotation mark)
const lines = content.split('\n')
const fixed = lines.map(line => {
  if (!line.includes('„')) return line
  // Replace ASCII " that closes a „...quote with U+201D
  return line.replace(/„([^"“”]*?)"/g, '„$1”')
})

const result = fixed.join('\n')
fs.writeFileSync('src/locales/de_batch3.translations.json', result, 'utf8')

try {
  JSON.parse(result)
  console.log('Fixed! Valid JSON.')
} catch (e) {
  console.log('Still invalid:', e.message)
}
