import { readFile, unlink, writeFile } from "fs/promises";
import { join, sep } from "path";

import sharp from "sharp";
import { ECMA, minify } from "terser";
import ttf2woff2 from "ttf2woff2";

import { __client_wwwroot_dirname, __dirname, __is_Debug, __project_dirname } from "./globals.js";
import { exec, fileExists } from "./utilities.js";
import { testCache } from "./caching.js";

export async function minifyTypescript(itempath: string)
{
    if (await testCache(itempath, "min.js"))
    {
        try
        {
            const output = itempath.replace(".ts", ".js");
            const outputmin = itempath.replace(".ts", ".min.js");
            const outputminmap = output.replace(".ts", "min.js.map");
            console.log(`  | Minifying Typescript: ${sep}wwwroot-dev${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot${output.replace(__client_wwwroot_dirname, "")}`);
            await exec(`npx tsc ${itempath} --outDir ${__client_wwwroot_dirname} --target ES2020 --lib DOM,ES2020,WebWorker --forceConsistentCasingInFileNames --strict --skipLibCheck --noImplicitAny --importsNotUsedAsValues preserve`);
            if (await fileExists(output))
            {
                const result = await minify(await readFile(output, "utf-8"), { sourceMap: __is_Debug, module: false, mangle: false, ecma: 2020 as ECMA, compress: !__is_Debug });
                if (result)
                {
                    if (await fileExists(outputmin)) await unlink(outputmin);
                    await writeFile(outputmin, result.code as string);
                    if (__is_Debug && await fileExists(outputminmap)) await unlink(outputminmap);
                    if (__is_Debug) await writeFile(outputminmap, result.map as string);
                }
                else throw `Terser failed to minify ${output}`;  
            }
            else throw `Typescript failed to write ${output}`; 
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | Typescript Minification Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}

export async function minifySass(itempath: string)
{
    if (await testCache(itempath, "min.css"))
    {
        try
        {
            const output = itempath.replace(".sass", ".css");
            const outputmin = itempath.replace(".sass", ".min.css");
            console.log(`  | Minifying SASS:       ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot${output.replace(__client_wwwroot_dirname, "") }`);
            if (await fileExists(output)) await unlink(output);
            await exec(`dart ${__dirname}/sass-minify.dart ${join(__client_wwwroot_dirname, "sass", "bundle.sass")} ${output}`);
            if (await fileExists(output))
            {
                if (await fileExists(outputmin)) await unlink(outputmin);
                await writeFile(outputmin, await readFile(output, "utf-8"));
            }
            else throw `Dart SASS failed to write ${output}`;
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | SASS Minification Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}

export async function convertTTFtoWOFF2(itempath: string)
{
    if (await testCache(itempath, "woff2"))
    {
        try 
        {
            const output = itempath.replace(".ttf", ".woff2");
            console.log(`  | Optimising TTF:       ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ""));
            await writeFile(output, ttf2woff2(await readFile(itempath)));
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | TTF To WOFF2 Conversion Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}

export async function transcodePNGToAVIF(itempath: string)
{
    if (await testCache(itempath, "avif"))
    {
        try 
        {
            const output: string = itempath.replace(".png", ".avif");
            console.log(`  | Transcoding Image:    ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ""));
            const avif = await sharp(await readFile(itempath)).avif({ quality: __is_Debug ? 90 : 65, effort: __is_Debug ? 2 : 9 }).toBuffer();
            await writeFile(output, avif);
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | PNG To AVIF Trancoding Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}

/*
 * TODO: Figure out how to automate an FFmpeg build script.
 * - Must be built in WSL2 Ubuntu.
 * - Must move ffmpeg.exe from Ubuntu to the same folder as the sln.
 * - Must add ffmpeg.exe to the .gitignore.
 * - Must include builds --enable-nonfree --enable-libfdk_aac --enable-libasvav1
 * - Use -c:a libfdk_aac -profile:a aac_he_v2 -b:a 32k
 */

export async function transcodeH264ToAV1(itempath: string)
{
    if (await testCache(itempath, "mp4"))
    {
        const output = itempath;
        try
        {
            console.log(`  | Transcoding Video:    ${sep}wwwroot-dev${itempath.replace(__client_wwwroot_dirname, "") }`);
            await exec(`ffmpeg -y -i ${itempath} -c:v libsvtav1 -svtav1-params fast-decode=1 ${(__is_Debug ? "-preset 6 -crf 52" : "-preset 0 -crf 52")} -movflags +faststart -c:a aac -movflags +faststart -q:a 0 ${output}`);
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}

export async function transcodeMP3ToAAC(itempath: string)
{
    if (await testCache(itempath, "aac"))
    {
        const output = itempath.replace(".mp3", ".aac");
        try
        {
            console.log(`  | Transcoding Audio:    ${sep}wwwroot-dev${itempath.replace(__client_wwwroot_dirname, "") }`);
            await exec(`ffmpeg -y -i ${itempath} -movflags +faststart -c:a aac -q:a 0 ${output}`);
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}