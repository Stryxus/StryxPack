import { AssetCacheManifest, SettingsManifest } from "./utilities";

export const settingsManifest: SettingsManifest =
{
    version: 0
};

export let cachedManifest: AssetCacheManifest =
{
    manifest: []
};

export const pwaManifest: AssetCacheManifest =
{
    manifest: []
};

export function setCachedManifest(manifest: AssetCacheManifest)
{
    cachedManifest = manifest;
}