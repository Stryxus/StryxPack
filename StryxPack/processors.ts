import { copyFile, mkdir, readFile, truncate, unlink, writeFile } from 'fs/promises';
import { dirname, join, sep } from 'path';

import sharp from 'sharp';
import { ECMA, minify } from 'terser';
import ffmpeg from 'ffmpeg-static';
import ttf2woff2 from 'ttf2woff2';

import { __client_wwwrootdev_dirname, __client_wwwroot_dirname, __dirname, __is_Debug, __project_dirname } from './globals.js';
import { exec, fileExists } from './utilities.js';
import { analyseCSS } from './analysers.js';
import { testCache } from './caching.js';

let hasSASSBundleCompiled = false;
let hasTSBundleCompiled = false;

export function resetCompilationVariables()
{
    hasSASSBundleCompiled = false;
    hasTSBundleCompiled = false;
}

export async function runSimpleCopy(itempath: string, identifier: string)
{
    if (await testCache(itempath, identifier))
    {
        try
        {
            const output = itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname);
            console.log(`  | Copying:              ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            await mkdir(dirname(output), { recursive: true });
            await copyFile(itempath, output);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | Copy Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}

export async function minifyTypescript(itempath: string, bundle: boolean)
{
    if (await testCache(itempath, 'min.js') && (!hasTSBundleCompiled || !bundle))
    {
        try
        {
            const requireFilePath = join(__dirname, 'node_modules', 'requirejs', 'require.js');
            const output = bundle ? join(__client_wwwroot_dirname, 'bundle.min.js') : itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).replace('.ts', '.js');
            console.log('  | Minifying Typescript: ' + (bundle ? `${sep}wwwroot${sep}bundle.min.js - ${sep}wwwroot${sep}bundle.js.map` : `${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') +
                ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, '')));
            await exec('npx tsc ' + (bundle ? join(__client_wwwrootdev_dirname, 'ts', 'bundle.ts') + ' --outFile "' + output + '"' : join(__client_wwwrootdev_dirname, 'ts', 'bundle.ts') + ' --outDir ' + __client_wwwroot_dirname) +
                ' --target ES2021 --lib DOM,ES2021' + (bundle ? ' --module amd' : ',WebWorker') +
                ' --forceConsistentCasingInFileNames --strict --skipLibCheck --noImplicitAny --importsNotUsedAsValues preserve');
            const result = await minify((bundle ? await readFile(requireFilePath, 'utf-8') : '') + await readFile(output, 'utf-8'), { sourceMap: __is_Debug, module: false, mangle: false, ecma: 2020 as ECMA, compress: !__is_Debug });
            await truncate(output, 0);
            const mapFilename = output.replace('.js', '.js.map');
            if (__is_Debug && await fileExists(mapFilename)) await truncate(mapFilename, 0);
            await writeFile(output, result.code as string);
            if (__is_Debug) await writeFile(mapFilename, result.map as string);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | Typescript Minification Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
        hasTSBundleCompiled = true;
    }
}

export async function minifySass(itempath: string)
{
    if (await testCache(itempath, 'min.css') && !hasSASSBundleCompiled)
    {
        try
        {
            // TODO: Get this to push the errors to the main command line
            console.log(`  | Minifying SASS:       ${sep}wwwroot${sep}bundle.min.css - ${sep}wwwroot${sep}bundle.css.map`);
            await exec(`start /min cmd /C dart sass-minify.dart ${join(__client_wwwrootdev_dirname, 'sass', 'bundle.sass')} ${join(__client_wwwroot_dirname, 'bundle.min.css')}`);
            const output = join(__client_wwwroot_dirname, 'bundle.min.css');
            const minified = await analyseCSS(await readFile(output, 'utf-8'));
            await truncate(output, 0);
            await writeFile(output, minified);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | SASS Minification Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
        hasSASSBundleCompiled = true;
    }
}

export async function convertTTFtoWOFF2(itempath: string)
{
    if (await testCache(itempath, 'woff2'))
    {
        try 
        {
            const output = itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).replace('.ttf', '.woff2');
            console.log(`  | Optimising TTF:       ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            await mkdir(dirname(output), { recursive: true });
            await writeFile(output, ttf2woff2(await readFile(itempath)));
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | TTF To WOFF2 Conversion Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}

export async function transcodePNGToAVIF(itempath: string)
{
    if (await testCache(itempath, 'avif'))
    {
        try 
        {
            const output: string = itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).replace('.png', '.avif');
            console.log(`  | Transcoding Image:    ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            const avif = await sharp(await readFile(itempath))
                .avif({ quality: __is_Debug ? 90 : 65, effort: __is_Debug ? 2 : 9 })
                .toBuffer();
            await mkdir(dirname(output), { recursive: true });
            if (await fileExists(itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname))) await unlink(itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname));
            await writeFile(output, avif);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | PNG To AVIF Trancoding Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}

export async function transcodeH264ToAV1(itempath: string)
{
    if (await testCache(itempath, 'mp4'))
    {
        const output = itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname);
        try
        {
            console.log(` | Transcoding Video:    ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            await mkdir(dirname(output), { recursive: true });
            await exec('start cmd /C ' + ffmpeg + ' -y -i ' + itempath + ' -c:v libaom-av1 ' + (__is_Debug ? '-crf 52' : '-crf 30 -b:v 200k') + ' -movflags +faststart -c:a aac -movflags +faststart -q:a 0 ' + output);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}

export async function transcodeMP3ToAAC(itempath: string)
{
    if (await testCache(itempath, 'aac'))
    {
        const output = itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).replace('.mp3', '.aac');
        try
        {
            console.log(` | Transcoding Video:    ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            await mkdir(dirname(output), { recursive: true });
            await exec('start cmd /C ffmpeg -y -i ' + itempath + ' -c:a aac -movflags +faststart -q:a 0 ' + output);
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}