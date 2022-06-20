// Object Literal Interfaces
export interface SettingsManifest { version: number }
export interface AssetCache { path: string; hash: string }
export interface AssetCacheManifest { manifest: Array<AssetCache> }

export let settingsManifest: SettingsManifest;
export let cachedManifest: AssetCacheManifest;
export let pwaManifest: AssetCacheManifest;

export function setCachedManifest(manifest: AssetCacheManifest)
{
    cachedManifest = manifest;
}