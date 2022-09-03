import { dirname, join } from "path";
import { fileURLToPath } from "url";

const { default: pLimit } = await import("p-limit");

export const limit = pLimit(1);

export const __project_name = "StryxPack";
export const __project_introduction = __project_name + " By Connor \"Stryxus\" Shearer.\n";

// Directories
export let __dirname: string;
export let __project_dirname: string;
export let __client_dirname: string;

export let __client_wwwroot_dirname: string;

// Files
export let __cache_filename: string;

// Special Strings
export const __special_characters_regex = /[ `!@#$%^&*()_+=[\]{};":"\\|,.<>/?~]/;

// Booleans
export let __is_Debug = false;

// Setters
export function setDebugMode() { __is_Debug = true; }
export function setProjectPaths(relativeClientDirPath: string)
{
    __dirname = dirname(fileURLToPath(import.meta.url));
    __project_dirname = join(__dirname, "../");
    __cache_filename = join(__project_dirname, __project_name.toLocaleLowerCase() + "-cache.json");
    __client_dirname = join(__project_dirname, relativeClientDirPath);
    __client_wwwroot_dirname = join(__client_dirname, "wwwroot");
}