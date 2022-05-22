import { join } from 'path';
import { readFile } from 'fs/promises';
import crypto from 'crypto';

import { fileExists, __dirname } from './utilities.js';
import { cachedManifest } from './manifests.js';
import { setHasUpdateQueued, __client_wwwrootdev_dirname, __client_wwwroot_dirname } from './globals.js';

export async function testCache(itempath: string, outExt: string)
{
    const entryExists = cachedManifest.manifest.map(x => x.path).indexOf(itempath) > -1;
    var shouldCache = true;
    const sha = crypto.createHash('sha256');
    sha.setEncoding('hex');
    sha.write(await readFile(itempath));
    sha.end();
    const hash = sha.read();
    if (entryExists)
    {
        const entry = cachedManifest.manifest.filter(file => file.path === itempath)[0];
        const outFileExists = await fileExists(
            outExt == 'min.css' ? join(__client_wwwroot_dirname, 'bundle.min.css') :
                outExt == 'min.js' ? join(__client_wwwroot_dirname, 'bundle.min.js') :
                    itempath.replace(__client_wwwrootdev_dirname, __client_wwwroot_dirname).substring(0, itempath.lastIndexOf('.') - 4) + '.' + outExt);
        shouldCache = outFileExists ? entry.hash !== hash : true;
    }
    if (shouldCache)
    {
        if (cachedManifest.manifest.map(x => x.path).indexOf(itempath) > -1) cachedManifest.manifest.splice(cachedManifest.manifest.map(x => x.path).indexOf(itempath), 1);
        cachedManifest.manifest.push({ path: itempath, hash: hash });
        setHasUpdateQueued(true);
    }
    return shouldCache;
}

/*
export async function createManifest(__client_wwwroot_dirname: string)
{
    await Promise.all((await findFiles(__client_wwwroot_dirname)).filter(item => !item.name.includes('arasaki-os-caches-manifest.json')).map(item => limit(async () =>
    {
        const data = await readFile(item.path).then(data => data);
        if (data) 
        {
            const sha = crypto.createHash('sha256');
            sha.setEncoding('hex');
            sha.write(data);
            sha.end();
            cachedManifest.manifest.push(literalCast<AssetCache>({
                path: String(item.name), hash: sha.read()
            }));
        }
    })));
    const cachesManifestFile = join(__client_wwwroot_dirname, 'arasaki-os-caches-manifest.json');
    if (await fileExists(cachesManifestFile)) await truncate(cachesManifestFile, 0);
    await writeFile(cachesManifestFile, JSON.stringify(cachedManifest, null, '\t'));
}
*/