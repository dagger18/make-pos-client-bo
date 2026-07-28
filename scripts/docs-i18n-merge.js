const fs = require('fs')
const path = require('path')

const langs = ['zh', 'vi', 'ja', 'de', 'ko', 'es', 'ar']
const localesDir = path.join(__dirname, '..', 'public', 'docs', 'user-guide', 'locales')
const potPath = path.join(localesDir, 'messages.pot')

// ── helpers (copied from scripts/i18n-merge.js) ────────────────────────────

function parseBlocks(content) {
  const blocks = []
  const raw = content.replace(/\r\n/g, '\n')
  const sections = raw.split(/\n\n+/)
  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue
    blocks.push(trimmed)
  }
  return blocks
}

function extractField(block, field) {
  const lines = block.split('\n')
  let value = null
  let collecting = false
  for (const line of lines) {
    if (line.startsWith(field + ' "')) {
      value = line.slice(field.length + 2, -1)
      collecting = true
    } else if (collecting && line.startsWith('"')) {
      value += line.slice(1, -1)
    } else if (collecting) {
      break
    }
  }
  return value
}

function buildTranslationMap(poContent) {
  const map = new Map()
  const blocks = parseBlocks(poContent)
  for (const block of blocks) {
    const msgid = extractField(block, 'msgid')
    const msgstr = extractField(block, 'msgstr')
    if (msgid !== null && msgstr !== null && msgstr !== '') {
      map.set(msgid, msgstr)
    }
  }
  return map
}

function buildMergedPo(potContent, existingTranslations, lang) {
  const blocks = parseBlocks(potContent)
  const outputBlocks = []

  // Header block (first block with empty msgid)
  const headerBlock = blocks.find(b => {
    const id = extractField(b, 'msgid')
    return id === ''
  })
  if (headerBlock) {
    let hb = headerBlock
    if (hb.includes('Language:')) {
      // Replace existing Language value
      hb = hb.replace(/Language: [^\n"]+/, `Language: ${lang}`)
    } else if (hb.includes('Content-Type')) {
      // Append Language after Content-Transfer-Encoding or at end of header strings
      hb = hb.replace(/(Content-Transfer-Encoding:[^\n"]*\\n")/, `$1\n"Language: ${lang}\\n"`)
    } else {
      // Add all header fields
      hb = hb.replace(/msgstr ""/,
        `msgstr ""\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Content-Transfer-Encoding: 8bit\\n"\n"Language: ${lang}\\n"`)
    }
    outputBlocks.push(hb)
  }

  // Message blocks
  for (const block of blocks) {
    const msgid = extractField(block, 'msgid')
    if (msgid === '' || msgid === null) continue

    const existing = existingTranslations.get(msgid)
    if (existing) {
      const lines = block.split('\n')
      const newLines = []
      let inMsgstr = false
      let addedMsgstr = false
      for (const line of lines) {
        if (line.startsWith('msgstr ')) {
          inMsgstr = true
          const escaped = existing.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
          newLines.push(`msgstr "${escaped}"`)
          addedMsgstr = true
        } else if (inMsgstr && line.startsWith('"')) {
          continue
        } else {
          if (inMsgstr) inMsgstr = false
          newLines.push(line)
        }
      }
      if (!addedMsgstr) newLines.push('msgstr ""')
      outputBlocks.push(newLines.join('\n'))
    } else {
      outputBlocks.push(block)
    }
  }

  return outputBlocks.join('\n\n') + '\n'
}

// ── main ───────────────────────────────────────────────────────────────────

if (!fs.existsSync(potPath)) {
  console.error(`POT file not found: ${potPath}`)
  console.error('Run docs-i18n-extract.js first.')
  process.exit(1)
}

const potContent = fs.readFileSync(potPath, 'utf8')

for (const lang of langs) {
  const poPath = path.join(localesDir, `${lang}.po`)
  let existingTranslations = new Map()
  if (fs.existsSync(poPath)) {
    const poContent = fs.readFileSync(poPath, 'utf8')
    existingTranslations = buildTranslationMap(poContent)
    console.log(`${lang}: loaded ${existingTranslations.size} existing translations`)
  } else {
    console.log(`${lang}: creating new file`)
  }
  const merged = buildMergedPo(potContent, existingTranslations, lang)
  fs.writeFileSync(poPath, merged, 'utf8')
  console.log(`${lang}: written to ${lang}.po`)
}

console.log('Done.')
