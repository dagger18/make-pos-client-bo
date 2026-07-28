const fs = require('fs');
const path = require('path');
const sass = require('sass');
const http = require('https');
const { generateFonts } = require('fantasticon');
const fontSvgDir = path.resolve(__dirname, 'fonts')
const fontSvgMap = {
  fab: 'fa-brands-400.svg',
  fad: 'fa-duotone-900.svg',
  fal: 'fa-light-300.svg',
  far: 'fa-regular-400.svg',
  fas: 'fa-solid-900.svg',
  fat: 'fa-thin-100.svg',
  //fasr: 'fa-sharp-regular-400.svg',
  //fasl: 'fa-sharp-light-300.svg',
  //fass: 'fa-sharp-solid-900.svg',
}
const iconPackNameMap = {
  'fa-brands': 'fab',
  'fa-duotone': 'fad',
  'fa-light': 'fal',
  'fa-regular': 'far',
  'fa-solid': 'fas',
  'fa-thin': 'fat',
}
const srcPaths = [
  path.resolve(__dirname, '../../../src/views'),
  path.resolve(__dirname, '../../../src/pages'),
  path.resolve(__dirname, '../../../src/layouts'),
  path.resolve(__dirname, '../../../src/config'),
  path.resolve(__dirname, '../../../src/components'),
  path.resolve(__dirname, '../../../src/@layouts'),
  path.resolve(__dirname, '../../../src/@core')
]
const publicFontPath = path.resolve(__dirname, '../../../src/assets/fonts')
const finalCSSPath = path.resolve(__dirname, '../../../src/assets/styles/_font-awesome.scss')

async function fetchFontS3(fontFile) {
  const fontSvgPath = fontSvgDir + '/' + fontFile
  if (fs.existsSync(fontSvgPath)) {
    return fs.readFileSync(fontSvgPath).toString();
  }
  const file = fs.createWriteStream(fontSvgPath);
  await new Promise(
    (resolve, reject) => {
      const request = http.get(
        `https://groupe-ics-sgp-dev.s3.ap-southeast-1.amazonaws.com/fa/${fontFile}`,
        (response) => {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`Download Completed ${fontFile}`);
            resolve()
          });
        }
      );
    }
  )
  return fs.readFileSync(fontSvgPath).toString();
}

async function ensureDirExist(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirExist(dirname);
  fs.mkdirSync(dirname);
}
async function cleanDir(directory) {
  const files = fs.readdirSync(directory)
  for (const file of files) {
    fs.unlinkSync(path.join(directory, file), err => {
      if (err) throw err;
    });
  }
}

async function getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

function isIgnoredFile(file) {
  const prefix = 'vendor\\sylius\\bootstrap-theme\\SyliusShopBundle\\views\\'
  return [
    'Common\\Macro\\buttons.html.twig',
  ].some(name => {
    return file.endsWith(prefix + name)
  })
}

async function generateNormalPack(iconList, iconPack) {
  const fontFileContent = await fetchFontS3(fontSvgMap[iconPack])
  const codepoints = {}
  const regex = /<glyph\sglyph-name="([a-z0-9\-\.]+)"\sunicode="([^"]+)"((?!\/>).)*((\r)?\n((?!\/>).)*)*\/>/gm;
  const svgIconDir = path.resolve(__dirname, `svg/${iconPack}`)
  ensureDirExist(`${svgIconDir}/dwadaw.svg`)
  await cleanDir(svgIconDir)
  while (m = regex.exec(fontFileContent)) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    let iconIndex = iconList.indexOf(`fa-${m[1]}`)

    if(iconIndex !== -1 && !m[2].startsWith('&#x1')) {
      const pathContent = m[0].replace('<glyph', '<path transform="scale(1, -1) translate(0, -512)"') + '\n'
      const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n${pathContent}</svg>`
      const svgIconName = iconList[iconIndex].replace('fa-', '')
      const svgIconPath = `${svgIconDir}/${svgIconName}.svg`
      fs.writeFileSync(svgIconPath, svgContent)
      iconList.splice(iconIndex, 1);
      codepoints[m[1]] = m[2].length === 1 ? m[2].codePointAt() : parseInt(m[2].replace('&#x','').replace(';',''), 16);
    }
  }
  const iconPackSub = Object.keys(iconPackNameMap).find(key => {
    return iconPackNameMap[key] === iconPack
  })
  const fontSelector = `.${iconPackSub}:before,.${iconPack}`
  return await generateFonts({
    inputDir: svgIconDir, // (required)
    outputDir: publicFontPath, // (required)
    name: iconPack,
    fontTypes: ['woff2', 'woff', 'ttf', 'svg'],
    assetTypes: ['css'],
    templates: {
      css: path.resolve(__dirname, 'css.hbs')
    },

    pathOptions: {},
    fontHeight: 512,
    round: undefined, // --
    //descent: -64, // Will use `svgicons2svgfont` defaults
    normalize: undefined, // --
    selector: fontSelector,
    tag: 'i',
    prefix: `fa`,
    fontsUrl: '../fonts',
    formatOptions: {
      svg: {
        centerHorizontally: true,
        centerVertically: true
      }
    },
    codepoints
  }).then(results => results.assetsOut.css);
}

async function generateDuotonePack(iconList, iconPack) {
  let css = '';
  const fontFileContent = await fetchFontS3(fontSvgMap[iconPack])
  const codepoints = {}
  const regex = /<glyph\sglyph-name="([a-z0-9\-\.]+)"\sunicode="([^"]+)"((?!\/>).)*((\r)?\n((?!\/>).)*)*\/>/gm;
  const svgIconPrimaryDir = path.resolve(__dirname, `svg/${iconPack}-primary`)
  const svgIconSecondaryDir = path.resolve(__dirname, `svg/${iconPack}-secondary`)
  ensureDirExist(`${svgIconPrimaryDir}/dwadaw.svg`)
  ensureDirExist(`${svgIconSecondaryDir}/dwadaw.svg`)
  await cleanDir(svgIconPrimaryDir)
  await cleanDir(svgIconSecondaryDir)
  while (m = regex.exec(fontFileContent)) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    const glyphName = m[1].replace('-primary', '').replace('-secondary', '')
    let iconIndex = iconList.indexOf(`fa-${glyphName}`)

    if(iconIndex !== -1 && !m[2].startsWith('&#x1')) {
      const pathContent = m[0].replace('<glyph', '<path transform="scale(1, -1) translate(0, -512)"') + '\n'
      const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n${pathContent}</svg>`
      const svgIconName = iconList[iconIndex].replace('fa-', '')
      if(m[1].endsWith('primary')) {
        const svgIconPath = `${svgIconPrimaryDir}/${svgIconName}.svg`
        fs.writeFileSync(svgIconPath, svgContent)
        iconList.splice(iconIndex, 1);
        codepoints[glyphName] = m[2].length === 1 ? m[2].codePointAt() : parseInt(m[2].replace('&#x','').replace(';',''), 16);
      } else if(m[1].endsWith('secondary')) {
        const svgIconPath = `${svgIconSecondaryDir}/${svgIconName}.svg`
        fs.writeFileSync(svgIconPath, svgContent)
      }
    }
  }
  const iconPackSub = Object.keys(iconPackNameMap).find(key => {
    return iconPackNameMap[key] === iconPack
  })
  // for primary
  const fontSelector = `.${iconPackSub}:before,.${iconPack}`
  css += await generateFonts({
    inputDir: svgIconPrimaryDir, // (required)
    outputDir: publicFontPath, // (required)
    name: iconPack,
    fontTypes: ['woff2', 'woff', 'ttf', 'svg'],
    assetTypes: ['css'],
    templates: {
      css: path.resolve(__dirname, 'css.hbs')
    },

    pathOptions: {},
    fontHeight: 512,
    round: undefined, // --
    //descent: -64, // Will use `svgicons2svgfont` defaults
    normalize: undefined, // --
    selector: fontSelector,
    tag: 'i',
    prefix: `fa`,
    fontsUrl: '../fonts',
    codepoints
  }).then(results => results.assetsOut.css);

  // for secondary
  css += await generateFonts({
    inputDir: svgIconSecondaryDir, // (required)
    outputDir: publicFontPath, // (required)
    name: iconPack + '-secondary',
    fontTypes: ['woff2', 'woff', 'ttf'],
    assetTypes: ['css'],
    templates: {
      css: path.resolve(__dirname, 'css-duotone-secondary.hbs')
    },

    pathOptions: {},
    fontHeight: 512,
    round: undefined, // --
    //descent: -64, // Will use `svgicons2svgfont` defaults
    normalize: undefined, // --
    selector: `.${iconPackSub}:after,.${iconPack}`,
    tag: 'i',
    prefix: `fa`,
    fontsUrl: '../fonts',
    codepoints
  }).then(results => results.assetsOut.css);
  return css
}

module.exports = async (cb) => {
  const srcFiles = Array.prototype.concat(
    ...(
      await Promise.all(
        srcPaths.map((path) => {
          return getFiles(path)
        })
      )
    )
  )

  const icons = {
    'fab': [],
    'fad': [],
    'fal': [],
    'far': [],
    'fas': [],
    'fat': [],
  }

  srcFiles.forEach(async (file) => {
    // some file that overriden cause they have old icon from v5
    if(isIgnoredFile(file)) return
    const fileContent = fs.readFileSync(file).toString()
    const regex = /(fa[a-z\-]+)\s(fa-[a-z0-9\-\.]+)/gm;
    let m;
    while ((m = regex.exec(fileContent)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      const iconPackName = iconPackNameMap[m[1]] || m[1]
      if(icons[iconPackName].indexOf(m[2]) === -1) {
        icons[iconPackName].push(m[2])
      }
    }
  })
  let cssTotal = fs.readFileSync(path.resolve(__dirname, 'fa-core.css')).toString()
  for(let iconPack in icons) {
    if(icons[iconPack].length == 0) continue;
    console.log(iconPack, icons[iconPack])
    let css = null
    // duotone is good
    if(iconPack === 'fad') {
      css = await generateDuotonePack(icons[iconPack], iconPack)
    } else {
      css = await generateNormalPack(icons[iconPack], iconPack)
    }

    cssTotal += css
  }
  fs.writeFileSync(finalCSSPath, cssTotal)
  console.log('remaining icon', icons)
}
