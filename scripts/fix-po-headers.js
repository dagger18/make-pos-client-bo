const fs = require('fs')
const langs = ['zh', 'vi', 'ja', 'ko', 'de', 'es', 'ar']

for (const lang of langs) {
  let content = fs.readFileSync('src/locales/' + lang + '.po', 'utf8')

  // Find the first blank line (double newline) — separates header from messages
  const blankLineIdx = content.indexOf('\n\n')
  if (blankLineIdx === -1) {
    console.log(lang + ': no blank line found')
    continue
  }

  const rest = content.slice(blankLineIdx)

  // Build correct PO header — the \n inside quoted strings is the PO escape (literal backslash + n)
  const header = [
    'msgid ""',
    'msgstr ""',
    '"Content-Type: text/plain; charset=UTF-8\\n"',
    '"Content-Transfer-Encoding: 8bit\\n"',
    '"Language: ' + lang + '\\n"',
    '',
  ].join('\n')

  const newContent = header + rest
  fs.writeFileSync('src/locales/' + lang + '.po', newContent, 'utf8')

  // Verify the Language header is present and correct
  const buf = fs.readFileSync('src/locales/' + lang + '.po')
  const snippet = buf.slice(0, 200).toString('utf8')
  if (snippet.includes('"Language: ' + lang)) {
    console.log(lang + ': header OK')
  } else {
    console.log(lang + ': FAILED - header:', JSON.stringify(snippet))
  }
}
