import { sep } from 'path';
import { readFile, truncate, writeFile } from 'fs/promises';
import process from 'process';

import chokidar from 'chokidar';
import getFolderSize from 'get-folder-size';
// Appease the Typescript compiler
let gFS: any = getFolderSize;
//

import { convertTTFtoWOFF2, minifySass, minifyTypescript, resetCompilationVariables, runSimpleCopy, transcodeH264ToAV1, transcodePNGToAVIF } from './processors.js';
import { fileExists, FileInfo, filterFiles, findFiles } from './utilities.js';
import { limit, setDebugMode, setHasUpdateQueued, __cache_filename, __client_wwwrootdev_dirname, __client_wwwroot_dirname, __has_Update_Queued, __is_Debug, __project_dirname, __project_introduction, __project_name } from './globals.js';
import { cachedManifest, setCachedManifest } from './manifests.js';

async function processing()
{
    console.log('\\   Running Bundle Pass...');
    console.log(' \\');

    resetCompilationVariables();
    setHasUpdateQueued(false);
    const files: Array<FileInfo> = (await findFiles(__client_wwwrootdev_dirname)).filter(file => !file.path.includes('node_modules') && !file.path.includes('package.json') && !file.path.includes('package-lock.json'));
    const tsFiles = filterFiles(files, 'ts').filter(file => file.name !== 'service-worker.ts' && file.name !== 'service-worker.published.ts');
    const swtsFiles = filterFiles(files, 'ts').filter(file => file.name === 'service-worker.ts' || file.name === 'service-worker.published.ts');
    const sassFile = filterFiles(files, 'sass');
    const htmlFiles = filterFiles(files, 'html');
    const svgFiles = filterFiles(files, 'svg');
    const jsonFiles = filterFiles(files, 'json').filter(file => file.name !== 'tsconfig.json');
    const ttfFiles = filterFiles(files, 'ttf');
    const woff2Files = filterFiles(files, 'woff2');
    const pngFiles = filterFiles(files, 'png').filter(file => file.name !== 'pwa-192.png' && file.name !== 'pwa-512.png');
    const pwapngFiles = filterFiles(files, 'png').filter(file => file.name === 'pwa-192.png' || file.name === 'pwa-512.png');
    const mp4Files = filterFiles(files, 'mp4');
    if (cachedManifest.manifest.length > 0) cachedManifest.manifest = [];

    await Promise.all(tsFiles.map(item => limit(async () => await minifyTypescript(item.path, true))));
    await Promise.all(swtsFiles.map(item => limit(async () => await minifyTypescript(item.path, false))));
    await Promise.all(sassFile.map(item => limit(async () => await minifySass(item.path))));
    await Promise.all(htmlFiles.map(item => limit(async () => await runSimpleCopy(item.path, 'html'))));
    await Promise.all(svgFiles.map(item => limit(async () => await runSimpleCopy(item.path, 'svg'))));
    await Promise.all(jsonFiles.map(item => limit(async () => await runSimpleCopy(item.path, 'json'))));
    await Promise.all(woff2Files.map(item => limit(async () => await runSimpleCopy(item.path, 'woff2'))));
    await Promise.all(ttfFiles.map(item => limit(async () => await convertTTFtoWOFF2(item.path))));
    await Promise.all(pngFiles.map(item => limit(async () => await transcodePNGToAVIF(item.path))));
    await Promise.all(pwapngFiles.map(item => limit(async () => await runSimpleCopy(item.path, 'png'))));
    await Promise.all(mp4Files.map(item => limit(async () => await transcodeH264ToAV1(item.path))));

    if (!__has_Update_Queued) console.log('  | No files have changed!');
    console.log(' /');

    if (await fileExists(__cache_filename)) await truncate(__cache_filename, 0).catch(err => console.error(err));
    await writeFile(__cache_filename, JSON.stringify(cachedManifest, null, '\t')).catch(err => console.error(err));

    const inputSize: number = await gFS.loose(__client_wwwrootdev_dirname);
    const outputSize: number = await gFS.loose(__client_wwwroot_dirname);

    console.log('| > Size Before: ' + inputSize.toLocaleString('en') + ' bytes');
    console.log('| > Size After:  ' + outputSize.toLocaleString('en') + ' bytes');
    console.log('| > Efficiency: ' + (100 - (outputSize / inputSize * 100)).toFixed(4).toString() + '%');
    console.log('/');
    console.log('\n----------------------------------------------------------------------------------------------------\n');
}

(async () =>
{
    console.clear();
    console.log(__project_introduction);

    process.argv.forEach(item =>
    {
        switch (item)
        {
            case 'build:debug': ;
                setDebugMode();
                break;
        }
    });

    if (await fileExists(__cache_filename)) setCachedManifest(JSON.parse(await readFile(__cache_filename, 'utf-8')));

    process.stdout.write(String.fromCharCode(27) + `]0;${__project_name} Bundler` + String.fromCharCode(7));

    await processing();

    if (__is_Debug)
    {
        chokidar.watch(__project_dirname, { awaitWriteFinish: true }).on('change', async (e, p) =>
        {
            const strp = String(p);
            if ([`${sep}UEFI${sep}`, `${sep}OS${sep}`].some(x => strp.includes(x)) &&
                ![`${sep}bin${sep}`, `${sep}obj${sep}`, `${sep}Properties${sep}`, `${sep}wwwroot${sep}`].some(x => strp.includes(x)))
            {
                console.clear();
                console.log(__project_introduction);
                await processing();
            }
        });
    }
})();
