const cpMap =  require('./codepoints.json')
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const http = require('https');
const { generateFonts } = require('fantasticon');
const fontSvgDir = path.resolve(__dirname, 'fonts')
const fontSvgMap = {
  tabler: 'fa-brands-400.svg'
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
const finalCSSPath = path.resolve(__dirname, '../../../src/assets/styles/_font-tabler.scss')

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
  const foundList = []
  const codepoints = {}
  const svgIconDir = path.resolve(__dirname, `svg/${iconPack}`)
  ensureDirExist(`${svgIconDir}/dwadaw.svg`)
  for (let index = 0; index < iconList.length; index++) {
    const icon = iconList[index]
    const svgIconName = icon.replace('tabler-', '')
    const svgIconPath = `${svgIconDir}/${svgIconName}.svg`
    if (!fs.existsSync(svgIconPath)) {
      const file = fs.createWriteStream(svgIconPath);
      await new Promise(
        (resolve, reject) => {
          const request = http.get(
            `https://groupe-ics-sgp-dev.s3.ap-southeast-1.amazonaws.com/tabler/${svgIconName}.svg`,
            (response) => {
              response.pipe(file);
              file.on("finish", () => {
                file.close();
                console.log(`Download Completed ${icon}`);
                foundList.push(icon)
                codepoints[icon] = parseInt(cpMap[icon], 16)
                resolve()
              });
            }
          );
        }
      )
    } else {
      foundList.push(icon)
      codepoints[icon] = parseInt(cpMap[icon], 16)
    }
  }

  console.log('remaining icon', iconList.filter((element) => !foundList.includes(element)))
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
    fontHeight: 24,
    round: undefined, // --
    //descent: -64, // Will use `svgicons2svgfont` defaults
    normalize: undefined, // --
    tag: 'i',
    prefix: `tabler`,
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
    'tabler': [],
  }

  srcFiles.forEach(async (file) => {
    // some file that overriden cause they have old icon from v5
    if(isIgnoredFile(file)) return
    const fileContent = fs.readFileSync(file).toString()
    const regex = /tabler-[a-z0-9\-\.]+/gm;
    let m;
    while ((m = regex.exec(fileContent)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      if(icons.tabler.indexOf(m[0]) === -1) {
        icons.tabler.push(m[0])
      }
    }
  })
  let cssTotal = fs.readFileSync(path.resolve(__dirname, 'font-core.css')).toString()
  for(let iconPack in icons) {
    if(icons[iconPack].length == 0) continue;
    console.log(iconPack, icons[iconPack])
    cssTotal += await generateNormalPack(icons[iconPack], iconPack)
  }
  fs.writeFileSync(finalCSSPath, cssTotal)
}
