import { readFile, truncate, writeFile } from "fs/promises";
import process from "process";

import chokidar from "chokidar";

import { convertTTFtoWOFF2, transcodeH264ToAV1, transcodeMP3ToAAC, transcodePNGToAVIF } from "./processors.js";
import { fileExists, FileInfo, filterFiles, findFiles } from "./utilities.js";
import { limit, setDebugMode, setProjectPaths, __cache_filename, __client_wwwroot_dirname, __is_Debug, __project_dirname, __project_introduction, __project_name } from "./globals.js";
import { cachedManifest, setCachedManifest } from "./manifests.js";

async function processing(path: string | undefined)
{
    if (path === undefined)
    {
        const files: Array<FileInfo> = (await findFiles(__client_wwwroot_dirname)).filter(file => !file.path.includes("node_modules") && !file.path.includes("package.json") && !file.path.includes("package-lock.json"));
        const ttfFiles = filterFiles(files, "ttf");
        const pngFiles = filterFiles(files, "png").filter(file => file.name !== "pwa-192.png" && file.name !== "pwa-512.png");
        const mp4Files = filterFiles(files, "mp4");
        const mp3Files = filterFiles(files, "mp3");

        await Promise.all(ttfFiles.map(item => limit(async () => await convertTTFtoWOFF2(item.path))));
        await Promise.all(pngFiles.map(item => limit(async () => await transcodePNGToAVIF(item.path))));
        await Promise.all(mp4Files.map(item => limit(async () => await transcodeH264ToAV1(item.path))));
        await Promise.all(mp3Files.map(item => limit(async () => await transcodeMP3ToAAC(item.path))));
    }
    else
    {
        if (path.endsWith(".ttf")) limit(async () => await convertTTFtoWOFF2(path));
        else if (path.endsWith(".png") || path.endsWith(".jpg")) limit(async () => await transcodePNGToAVIF(path));
        else if (path.endsWith(".mp4")) limit(async () => await transcodeH264ToAV1(path));
        else if (path.endsWith(".mp3")) limit(async () => await transcodeMP3ToAAC(path));
    }
    if (await fileExists(__cache_filename)) await truncate(__cache_filename, 0);
    await writeFile(__cache_filename, JSON.stringify(cachedManifest, null, "\t"));
}

(async () =>
{
    // 0: NodeJS CMD
    // 1: bootstrapper.js
    // 2: Client Relative Path
    if (process.argv.length < 4)
    {
        console.log("Not enough arguments were passed, please refer to the StryxPack README!");
        throw "Not enough arguments were passed, please refer to the StryxPack README!";
    }
    setProjectPaths(process.argv[2]);
    process.argv.forEach(item =>
    {
        switch (item)
        {
            case "build:debug":
                setDebugMode();
                break;
        }
    });

    if (await fileExists(__cache_filename)) setCachedManifest(JSON.parse(await readFile(__cache_filename, "utf-8")));
    else setCachedManifest({ manifest: [] });
    process.stdout.write(`${String.fromCharCode(27)}]0;${__project_name} Bundler ${String.fromCharCode(7)}`);

    console.clear();
    console.log(__project_introduction);
    console.log("\\ Bundler is now watching for changes.");
    console.log(" \\");
    await processing(undefined);
    if (__is_Debug)
    {
        chokidar.watch(__client_wwwroot_dirname, { awaitWriteFinish: true }).on("all", async (event, path) =>
        {
            if (event === "change" || event === "unlink") await processing(path);
        });
    }
})();
