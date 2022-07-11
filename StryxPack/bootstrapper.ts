import { readFile, truncate, writeFile } from 'fs/promises';
import process from 'process';

import chokidar from 'chokidar';
import getFolderSize from 'get-folder-size';
// Appease the Typescript compiler
let gFS: any = getFolderSize;
//

import { convertTTFtoWOFF2, minifySass, minifyTypescript, resetCompilationVariables, runSimpleCopy, transcodeH264ToAV1, transcodeMP3ToAAC, transcodePNGToAVIF } from './processors.js';
import { fileExists, FileInfo, filterFiles, findFiles } from './utilities.js';
import { limit, setDebugMode, setHasUpdateQueued, setProjectPaths, __cache_filename, __client_wwwrootdev_dirname, __client_wwwroot_dirname, __has_Update_Queued, __is_Debug, __project_dirname, __project_introduction, __project_name } from './globals.js';
import { cachedManifest, setCachedManifest } from './manifests.js';

async function processing(path: string | undefined)
{
    resetCompilationVariables();
    setHasUpdateQueued(false);
    if (path === undefined)
    {
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
        const mp3Files = filterFiles(files, 'mp3');
        const aacFiles = filterFiles(files, 'aac');

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
        await Promise.all(mp3Files.map(item => limit(async () => await transcodeMP3ToAAC(item.path))));
        await Promise.all(aacFiles.map(item => limit(async () => await runSimpleCopy(item.path, 'aac'))));
    }
    else
    {
        console.log(' \\');
        if (path.endsWith('.ts') && path.includes('service-worker')) limit(async () => await minifyTypescript(path, false));
        else if (path.endsWith('.ts')) limit(async () => await minifyTypescript(path, true));
        else if (path.endsWith('.sass')) limit(async () => await minifySass(path));
        else if (path.endsWith('.html')) limit(async () => await runSimpleCopy(path, 'html'));
        else if (path.endsWith('.svg')) limit(async () => await runSimpleCopy(path, 'svg'));
        else if (path.endsWith('.json')) limit(async () => await runSimpleCopy(path, 'json'));
        else if (path.endsWith('.woff2')) limit(async () => await runSimpleCopy(path, 'woff2'));
        else if (path.endsWith('.ttf')) limit(async () => await convertTTFtoWOFF2(path));
        else if (path.endsWith('.png') || path.endsWith('.jpg') && !path.endsWith('pwa-192.png') && path.endsWith('pwa-512.png')) limit(async () => await transcodePNGToAVIF(path));
        else if (path.endsWith('.png') && (path.endsWith('pwa-192.png') || path.endsWith('pwa-512.png'))) limit(async () => await runSimpleCopy(path, 'png'));
        else if (path.endsWith('.mp4')) limit(async () => await transcodeH264ToAV1(path));
        else if (path.endsWith('.mp3')) limit(async () => await transcodeMP3ToAAC(path));
        else if (path.endsWith('.aac')) limit(async () => await runSimpleCopy(path, 'aac'));
    }
    if (!__has_Update_Queued) console.log('   | No files have changed!');
    console.log(' /');
    if (await fileExists(__cache_filename)) await truncate(__cache_filename, 0).catch(err => console.error(err));
    await writeFile(__cache_filename, JSON.stringify(cachedManifest, null, '\t')).catch(err => console.error(err));
    const inputSize: number = await gFS.loose(__client_wwwrootdev_dirname);
    const outputSize: number = await gFS.loose(__client_wwwroot_dirname);
    console.log('  | > Size Before: ' + inputSize.toLocaleString('en') + ' bytes  |  Size After: ' + outputSize.toLocaleString('en') + ' bytes  |  Efficiency: ' + (100 - (outputSize / inputSize * 100)).toFixed(4).toString() + '%');
}

(async () =>
{
    // 0: NodeJS CMD
    // 1: bootstrapper.js
    // 2: Client Relative Path
    // 3: Server Relative Path
    if (process.argv.length < 4)
    {
        console.log('Not enough arguments were passed, please refer to the StryxPack README!');
        throw 'Not enough arguments were passed, please refer to the StryxPack README!';
    }
    setProjectPaths(process.argv[2], process.argv[3]);
    process.argv.forEach(item =>
    {
        switch (item)
        {
            case 'build:debug':
                setDebugMode();
                break;
        }
    });

    if (await fileExists(__cache_filename)) setCachedManifest(JSON.parse(await readFile(__cache_filename, 'utf-8')));
    else setCachedManifest({ manifest: [] });
    process.stdout.write(String.fromCharCode(27) + `]0;${__project_name} Bundler` + String.fromCharCode(7));

    console.clear();
    console.log(__project_introduction);
    console.log('\\ Bundler is now watching for changes.');
    console.log(' \\');
    await processing(undefined);
    if (__is_Debug)
    {
        chokidar.watch(__client_wwwrootdev_dirname, { awaitWriteFinish: true }).on('all', async (event, path) =>
        {
            if (event === 'change' || event === 'unlink') await processing(path);
        });
    }
})();
