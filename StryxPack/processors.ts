import { copyFile, mkdir, readFile, truncate, unlink, writeFile } from 'fs/promises';
import { dirname, join, sep } from 'path';

import sharp from 'sharp';
import { ECMA, minify } from 'terser';
import ffmpeg from 'ffmpeg-static';
import commandExists from 'command-exists';
import ttf2woff2 from 'ttf2woff2';

import { __client_wwwrootdev_dirname, __client_wwwroot_dirname, __is_Debug } from './globals';
import { exec, fileExists } from './utilities';
import { analyseCSS } from './analysers';
import { testCache } from './caching';

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
            console.log('  | Copying:              [' + identifier.toUpperCase() + `] ${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') + ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ''));
            await mkdir(dirname(output), { recursive: true }).catch(err => { throw err; });
            await copyFile(itempath, output).catch(err => { throw err; });
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
        hasTSBundleCompiled = bundle;
        try
        {
            const output = bundle ? join(__client_wwwroot_dirname, 'bundle.min.js') : itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).replace('.ts', '.js');
            console.log('  | Minifying Typescript: ' + (bundle ? `${sep}wwwroot${sep}bundle.min.js - ${sep}wwwroot${sep}bundle.js.map` : `${sep}wwwroot-dev` + itempath.replace(__client_wwwrootdev_dirname, '') +
                ` > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, '')));
            await exec('npx tsc ' + (bundle ? join(__client_wwwrootdev_dirname, 'ts', 'bundle.ts') + ' --outFile "' + output + '"' : itempath + ' --outDir ' + __client_wwwroot_dirname) +
                ' --target ES2021 --lib DOM,ES2021' + (bundle ? ' --module amd' : ',WebWorker') +
                ' --forceConsistentCasingInFileNames --strict --skipLibCheck --noImplicitAny --importsNotUsedAsValues preserve');
            const result = await minify((bundle ? await readFile(join(__client_wwwrootdev_dirname, 'node_modules', 'requirejs', 'require.js'), 'utf-8') : '') +
                await readFile(output, 'utf-8'), { sourceMap: __is_Debug, module: false, mangle: false, ecma: 2020 as ECMA, compress: !__is_Debug });
            await truncate(output, 0).catch(err => { throw err; });
            const mapFilename = output.replace('.js', '.js.map');
            if (__is_Debug && await fileExists(mapFilename)) await truncate(mapFilename, 0).catch(err => { throw err; });
            await writeFile(output, result.code as string).catch(err => { throw err; });
            if (__is_Debug) await writeFile(mapFilename, result.map as string).catch(err => { throw err; });
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | Typescript Minification Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}

export async function minifySass(itempath: string)
{
    if (await testCache(itempath, 'min.css') && !hasSASSBundleCompiled)
    {
        hasSASSBundleCompiled = true;
        try
        {
            commandExists('dart', async (err, exists) =>
            {
                if (!err && exists)
                {
                    console.log(`  | Minifying SASS:       ${sep}wwwroot${sep}bundle.min.css - ${sep}wwwroot${sep}bundle.css.map`);
                    const output = join(__client_wwwroot_dirname, 'bundle.min.css');
                    await exec(`start /min cmd /C dart sass-minify.dart ${join(__client_wwwrootdev_dirname, 'sass', 'bundle.sass')} ${output}`);
                }
                else throw 'Dart is not installed or command path index has not been updated if you did install it!';
            });
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | SASS Minification Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
        const output = join(__client_wwwroot_dirname, 'bundle.min.css');
        const minified = await analyseCSS(await readFile(output, 'utf-8'));
        await truncate(output, 0);
        await writeFile(output, minified);
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
                .avif({ quality: 70, effort: 9 })
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
            commandExists('dart', async (err, exists) =>
            {
                if (!err && exists)
                {
                    await exec('start cmd /C ffmpeg -y -i ' + itempath + (__is_Debug ? ' -c:v librav1e -rav1e-params speed=10:low_latency=true' : ' -c:v librav1e -b:v 200K -rav1e-params speed=0:low_latency=true') +
                        ' -movflags +faststart -c:a libopus -q:a 128 ' + output);
                }
                else
                {
                    console.error('No non-GPL compliant FFmpeg build detected in enviroment variables - falling back to libaom, video transcoding will take substantially longer and will be much lower quality!');
                    await exec('start cmd /C ' + ffmpeg + ' -y -i ' + itempath + ' -c:v libaom-av1 ' + (__is_Debug ? '-crf 52' : '-crf 30 -b:v 200k') + ' -movflags +faststart -c:a libopus -q:a 128 ' + output);
                }
            });
        }
        catch (e)
        {
            console.error('  | ------------------------------------------------------------------------------------------------');
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error('  | ------------------------------------------------------------------------------------------------');
        }
    }
}