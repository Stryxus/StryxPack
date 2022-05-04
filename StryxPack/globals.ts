import { join } from "path";

export const __project_name = 'StryxPack';
export const __project_introduction = __project_name + ' By Connor \'Stryxus\' Shearer.\n';

export const __cache_filename = join(__dirname, __project_name.toLocaleLowerCase() + '-cache.json');

export var __is_Debug = false;

export function setDebugMode() { __is_Debug = true; }