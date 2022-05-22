import { dirname, join } from "path";
import { fileURLToPath } from "url";

const { default: pLimit } = await import('p-limit');

export const limit = pLimit(1);

export const __project_name = 'StryxPack';
export const __project_introduction = __project_name + ' By Connor \'Stryxus\' Shearer.\n';

// Directories
export const __project_dirname = join(dirname(fileURLToPath(import.meta.url)), '../', '../');
export let __client_dirname: string;
export let __server_dirname: string;

export let __client_wwwroot_dirname: string;
export let __client_wwwrootdev_dirname: string;

// Files
export const __cache_filename = join(__project_dirname, __project_name.toLocaleLowerCase() + '-cache.json');

// Special Strings
export const __special_characters_regex = /[ `!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]/;

// Booleans
export let __is_Debug = false;
export let __has_Update_Queued = false;

// Setters
export function setDebugMode() { __is_Debug = true; }
export function setProjectPaths(relativeClientDirPath: string, relativeServerDirPath: string)
{
    __client_dirname = join(__project_dirname, relativeClientDirPath);
    __server_dirname = join(__project_dirname, relativeServerDirPath);
    __client_wwwroot_dirname = join(__client_dirname, 'wwwroot');
    __client_wwwrootdev_dirname = join(__client_dirname, 'wwwroot-dev');
}
export function setHasUpdateQueued(val: boolean) { __has_Update_Queued = val; }