const fs = require('fs')
const path = require('path')

const translations = require('../src/locales/translations.json')
const localesDir = path.join(__dirname, '..', 'src', 'locales')

for (const [lang, data] of Object.entries(translations)) {
  const outPath = path.join(localesDir, `${lang}.json`)
  fs.writeFileSync(outPath, JSON.stringify(data), 'utf8')
  console.log(`${lang}: ${Object.keys(data).length} entries → ${lang}.json`)
}
console.log('Done.')
