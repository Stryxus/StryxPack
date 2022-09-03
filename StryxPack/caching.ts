import { readFile } from "fs/promises";
import crypto from "crypto";

import { fileExists } from "./utilities.js";
import { cachedManifest } from "./manifests.js";
import { __client_wwwroot_dirname } from "./globals.js";

export async function testCache(itempath: string, outExt: string)
{
    const entryExists = cachedManifest.manifest.map(x => x.path).indexOf(itempath) > -1;
    var shouldCache = true;
    const sha = crypto.createHash("sha256");
    sha.setEncoding("hex");
    sha.write(await readFile(itempath));
    sha.end();
    const hash = sha.read();
    if (entryExists)
    {
        const entry = cachedManifest.manifest.filter(file => file.path === itempath)[0];
        const outFileExists = await fileExists(itempath.substring(0, itempath.lastIndexOf(".") - 4) + "." + outExt);
        shouldCache = outFileExists ? entry.hash !== hash : true;
    }
    if (shouldCache)
    {
        if (cachedManifest.manifest.map(x => x.path).indexOf(itempath) > -1) cachedManifest.manifest.splice(cachedManifest.manifest.map(x => x.path).indexOf(itempath), 1);
        cachedManifest.manifest.push({ path: itempath, hash: hash });
    }
    return shouldCache;
}