import { readFile, writeFile } from "fs/promises";
import { sep } from "path";

import sharp from "sharp";
import ttf2woff2 from "ttf2woff2";

import { __client_wwwroot_dirname, __dirname, __is_Debug, __project_dirname } from "./globals.js";
import { exec } from "./utilities.js";
import { testCache } from "./caching.js";

export async function convertTTFtoWOFF2(itempath: string)
{
    if (await testCache(itempath, "woff2"))
    {
        try 
        {
            const output = itempath.replace(".ttf", ".woff2");
            await writeFile(output, ttf2woff2(await readFile(itempath)));
            console.log(`  | Optimised TTF:       ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ""));
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
            const avif = await sharp(await readFile(itempath)).avif({ quality: __is_Debug ? 90 : 65, effort: __is_Debug ? 2 : 9 }).toBuffer();
            await writeFile(output, avif);
            console.log(`  | Transcoded Image:    ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")} > ${sep}wwwroot` + output.replace(__client_wwwroot_dirname, ""));
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
            await exec(`ffmpeg -y -i ${itempath} -c:v libsvtav1 -svtav1-params fast-decode=1 ${(__is_Debug ? "-preset 6 -crf 52" : "-preset 0 -crf 52")} -movflags +faststart -c:a aac -movflags +faststart -q:a 0 ${output}`);
            console.log(`  | Transcoded Video:    ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")}`);
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
            await exec(`ffmpeg -y -i ${itempath} -movflags +faststart -c:a aac -q:a 0 ${output}`);
            console.log(`  | Transcoded Audio:    ${sep}wwwroot${itempath.replace(__client_wwwroot_dirname, "")}`);
        }
        catch (e)
        {
            console.error("  | ------------------------------------------------------------------------------------------------");
            console.error(`  | FFMPEG Transcoding Error: ${e}`);
            console.error("  | ------------------------------------------------------------------------------------------------");
        }
    }
}