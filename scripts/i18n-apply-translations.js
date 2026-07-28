/**
 * Applies a translations JSON map to a locale .po file.
 * Usage: node scripts/i18n-apply-translations.js <lang>
 * Reads src/locales/<lang>.translations.json  → {msgid: msgstr, ...}
 * Updates src/locales/<lang>.po with those translations.
 */
const fs = require('fs')
const path = require('path')

const lang = process.argv[2]
if (!lang) { console.error('Usage: node i18n-apply-translations.js <lang>'); process.exit(1) }

const localesDir = path.join(__dirname, '..', 'src', 'locales')
const poPath = path.join(localesDir, `${lang}.po`)
const translationsPath = path.join(localesDir, `${lang}.translations.json`)

const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'))
const poContent = fs.readFileSync(poPath, 'utf8')

const lines = poContent.split('\n')
const out = []
let i = 0

while (i < lines.length) {
  const line = lines[i]

  // Collect a full msgid (may span multiple lines)
  if (line.startsWith('msgid ')) {
    let msgid = line.slice(7, -1)  // strip msgid " and trailing "
    let j = i + 1
    while (j < lines.length && lines[j].startsWith('"')) {
      msgid += lines[j].slice(1, -1)
      j++
    }
    out.push(line)
    for (let k = i + 1; k < j; k++) out.push(lines[k])
    i = j

    // Now handle msgstr
    if (i < lines.length && lines[i].startsWith('msgstr ')) {
      const translation = msgid !== '' ? translations[msgid] : null
      if (translation) {
        // Escape the translation for PO format
        const escaped = translation
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
        out.push(`msgstr "${escaped}"`)
      } else {
        out.push(lines[i])
      }
      i++
      // Skip any continuation lines of existing msgstr
      while (i < lines.length && lines[i].startsWith('"')) {
        if (!translation) out.push(lines[i])
        i++
      }
    }
  } else {
    out.push(line)
    i++
  }
}

fs.writeFileSync(poPath, out.join('\n'), 'utf8')
const count = Object.keys(translations).length
console.log(`${lang}: applied ${count} translations to ${lang}.po`)
