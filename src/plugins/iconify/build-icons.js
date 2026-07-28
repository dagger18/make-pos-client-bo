
import { promises as fs, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools';
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils';

async function getFiles(dir) {
const dirents = await fs.readdir(dir, { withFileTypes: true });
const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
}));
return Array.prototype.concat(...files);
}

// File to save bundle to
const target = join(__dirname, 'icons.css');
(async function () {
    const iconList = []
    const srcPaths = [
        resolve(__dirname, '../../../src/views'),
        resolve(__dirname, '../../../src/pages'),
        resolve(__dirname, '../../../src/layouts'),
        resolve(__dirname, '../../../src/config'),
        resolve(__dirname, '../../../src/components'),
        resolve(__dirname, '../../../src/@layouts'),
        resolve(__dirname, '../../../src/@core')
    ]
    const srcFiles = Array.prototype.concat(
        ...(
            await Promise.all(
            srcPaths.map((path) => {
                return getFiles(path)
            })
            )
        )
    )
    
    
    srcFiles.forEach((file) => {
    
        const fileContent = readFileSync(file).toString()
        const regex = /tabler-([a-z0-9\-\.]+)/gm;
        let m;
        while ((m = regex.exec(fileContent)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            if(iconList.indexOf(m[1]) === -1) {
                iconList.push(m[1])
            }
        }
    })

    const sources = {
        svg: [
            {
                dir: 'src/assets/images/iconify-svg',
                monotone: false,
                prefix: 'custom',
            }
        ],
        json: [
            {
                filename: require.resolve('@iconify-json/tabler/icons.json'),
                icons: iconList,
            }
        ],
    };

    // Create directory for output if missing
    const dir = dirname(target);
    try {
        await fs.mkdir(dir, {
            recursive: true,
        });
    }
    catch (err) {
        //
    }
    const allIcons = [];
    /**
     * Convert sources.icons to sources.json
     */
    if (sources.icons) {
        const sourcesJSON = sources.json ? sources.json : (sources.json = []);
        // Sort icons by prefix
        const organizedList = organizeIconsList(sources.icons);
        for (const prefix in organizedList) {
            const filename = require.resolve(`@iconify/json/json/${prefix}.json`);
            sourcesJSON.push({
                filename,
                icons: organizedList[prefix],
            });
        }
    }
    /**
     * Bundle JSON files and collect icons
     */
    if (sources.json) {
        for (let i = 0; i < sources.json.length; i++) {
            const item = sources.json[i];
            // Load icon set
            const filename = typeof item === 'string' ? item : item.filename;
            const content = JSON.parse(await fs.readFile(filename, 'utf8'));
            for (const key in content) {
                if (key === 'prefix' && content.prefix === 'tabler') {
                    for (const k in content.icons)
                        content.icons[k].body = content.icons[k].body.replace(/stroke-width="2"/g, 'stroke-width="1.5"');
                }
            }
            // Filter icons
            if (typeof item !== 'string' && item.icons?.length) {
                const filteredContent = getIcons(content, item.icons);
                if (!filteredContent)
                    throw new Error(`Cannot find required icons in ${filename}`);
                // Collect filtered icons
                allIcons.push(filteredContent);
            }
            else {
                // Collect all icons from the JSON file
                allIcons.push(content);
            }
        }
    }
    /**
     * Bundle custom SVG icons and collect icons
     */
    if (sources.svg) {
        for (let i = 0; i < sources.svg.length; i++) {
            const source = sources.svg[i];
            // Import icons
            const iconSet = await importDirectory(source.dir, {
                prefix: source.prefix,
            });
            // Validate, clean up, fix palette, etc.
            await iconSet.forEach(async (name, type) => {
                if (type !== 'icon')
                    return;
                // Get SVG instance for parsing
                const svg = iconSet.toSVG(name);
                if (!svg) {
                    // Invalid icon
                    iconSet.remove(name);
                    return;
                }
                // Clean up and optimise icons
                try {
                    // Clean up icon code
                    await cleanupSVG(svg);
                    if (source.monotone) {
                        // Replace color with currentColor, add if missing
                        // If icon is not monotone, remove this code
                        await parseColors(svg, {
                            defaultColor: 'currentColor',
                            callback: (attr, colorStr, color) => {
                                return !color || isEmptyColor(color) ? colorStr : 'currentColor';
                            },
                        });
                    }
                    // Optimise
                    await runSVGO(svg);
                }
                catch (err) {
                    // Invalid icon
                    console.error(`Error parsing ${name} from ${source.dir}:`, err);
                    iconSet.remove(name);
                    return;
                }
                // Update icon from SVG instance
                iconSet.fromSVG(name, svg);
            });
            // Collect the SVG icon
            allIcons.push(iconSet.export());
        }
    }
    // Generate CSS from collected icons
    const cssContent = allIcons
        .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), {
        iconSelector: '.{prefix}-{name}',
        mode: 'mask',
    }))
        .join('\n');
    // Save the CSS to a file
    await fs.writeFile(target, cssContent, 'utf8');
    console.log(`Saved CSS to ${target}!`);
})().catch(err => {
    console.error(err);
});
/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
    const sorted = Object.create(null);
    icons.forEach(icon => {
        const item = stringToIcon(icon);
        if (!item)
            return;
        const prefix = item.prefix;
        const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = []);
        const name = item.name;
        if (!prefixList.includes(name))
            prefixList.push(name);
    });
    return sorted;
}
