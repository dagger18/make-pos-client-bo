const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const langs = ['zh', 'vi', 'ja', 'de', 'ko', 'es', 'ar']
const docsDir = path.join(__dirname, '..', 'public', 'docs', 'user-guide')
const localesDir = path.join(docsDir, 'locales')

// ── PO parsing helpers ─────────────────────────────────────────────────────

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

// ── Redirect script for translated pages ──────────────────────────────────

function makeTranslatedRedirectScript(lang) {
  return `<script>
(function(){
  var lang='en';
  try{var m=document.cookie.match(/(?:^|;\\s*)user=([^;]*)/);if(m){var u=JSON.parse(decodeURIComponent(m[1]));if(u&&u.language)lang=u.language;}}catch(e){}
  if(lang==='${lang}')return;
  var f=location.pathname.split('/').pop();
  if(lang==='en'){location.replace('../'+f);}else{location.replace('../'+lang+'/'+f);}
})();
</script>`
}

// ── Redirect script for English source pages ───────────────────────────────

const EN_REDIRECT_SCRIPT = `<script>
(function(){
  var lang='en';
  try{var m=document.cookie.match(/(?:^|;\\s*)user=([^;]*)/);if(m){var u=JSON.parse(decodeURIComponent(m[1]));if(u&&u.language)lang=u.language;}}catch(e){}
  if(lang==='en')return;
  var f=location.pathname.split('/').pop();
  location.replace(lang+'/'+f);
})();
</script>`

// ── Cheerio options ────────────────────────────────────────────────────────

const CHEERIO_OPTS = { decodeEntities: false }

// ── Apply translations helper ──────────────────────────────────────────────

function applyTranslations($, translations) {
  // title
  const $title = $('title')
  const titleKey = $title.text().trim()
  if (titleKey && translations.has(titleKey)) {
    $title.text(translations.get(titleKey))
  }

  // .nav-group-title
  $('.nav-group-title').each((_, el) => {
    const key = $(el).text().trim()
    if (key && translations.has(key)) {
      $(el).text(translations.get(key))
    }
  })

  // nav .nav-item span and nav .nav-sub span
  $('nav .nav-item span, nav .nav-sub span').each((_, el) => {
    const key = $(el).text().trim()
    if (key && translations.has(key)) {
      $(el).text(translations.get(key))
    }
  })

  // .breadcrumb span
  $('.breadcrumb span').each((_, el) => {
    const key = $(el).text().trim()
    if (key && translations.has(key)) {
      $(el).text(translations.get(key))
    }
  })

  // h2, h3, h4 inside .content
  $('.content h2, .content h3, .content h4').each((_, el) => {
    const key = $(el).text().trim()
    if (key && translations.has(key)) {
      $(el).text(translations.get(key))
    }
  })

  // p inside .content — use innerHTML key and set innerHTML
  $('.content p').each((_, el) => {
    const key = ($(el).html() || '').trim()
    if (key && translations.has(key)) {
      $(el).html(translations.get(key))
    }
  })

  // li inside .content — use innerHTML key and set innerHTML
  $('.content li').each((_, el) => {
    const key = ($(el).html() || '').trim()
    if (key && translations.has(key)) {
      $(el).html(translations.get(key))
    }
  })

  // .tip — use innerHTML key and set innerHTML
  $('.tip').each((_, el) => {
    const key = ($(el).html() || '').trim()
    if (key && translations.has(key)) {
      $(el).html(translations.get(key))
    }
  })
}

// ── Get HTML files ─────────────────────────────────────────────────────────

const htmlFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'))
console.log(`Found ${htmlFiles.length} HTML files`)

// ── Step 1: Add redirect script to English source HTML files ───────────────

console.log('\nAdding redirect script to English source files...')
for (const file of htmlFiles) {
  const filePath = path.join(docsDir, file)
  const html = fs.readFileSync(filePath, 'utf8')

  // Only add if not already present
  if (html.includes('user=')) {
    console.log(`  ${file}: redirect script already present, skipping`)
    continue
  }

  const $ = cheerio.load(html, CHEERIO_OPTS)
  // Prepend as first child of <head>
  $('head').prepend('\n  ' + EN_REDIRECT_SCRIPT + '\n')
  fs.writeFileSync(filePath, $.html(), 'utf8')
  console.log(`  ${file}: added redirect script`)
}

// ── Step 2: Build translated output for each language ─────────────────────

for (const lang of langs) {
  const poPath = path.join(localesDir, `${lang}.po`)
  if (!fs.existsSync(poPath)) {
    console.log(`\n${lang}: PO file not found, skipping`)
    continue
  }

  const poContent = fs.readFileSync(poPath, 'utf8')
  const translations = buildTranslationMap(poContent)
  console.log(`\n${lang}: ${translations.size} translations loaded`)

  // Ensure output directory exists
  const outDir = path.join(docsDir, lang)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const redirectScript = makeTranslatedRedirectScript(lang)

  for (const file of htmlFiles) {
    const filePath = path.join(docsDir, file)
    const html = fs.readFileSync(filePath, 'utf8')
    const $ = cheerio.load(html, CHEERIO_OPTS)

    // Apply translations
    applyTranslations($, translations)

    // Fix relative CSS path: ./style.css → ../style.css
    $('link[href="./style.css"]').attr('href', '../style.css')

    // Set html lang attribute
    $('html').attr('lang', lang)

    // Remove any existing redirect script (from the English source), then add the lang-specific one
    $('head script').each((_, el) => {
      const scriptContent = $(el).html() || ''
      if (scriptContent.includes('user=')) {
        $(el).remove()
      }
    })
    $('head').prepend('\n  ' + redirectScript + '\n')

    const outPath = path.join(outDir, file)
    fs.writeFileSync(outPath, $.html(), 'utf8')
  }

  console.log(`${lang}: written ${htmlFiles.length} files to ${outDir}`)
}

console.log('\nDone.')
