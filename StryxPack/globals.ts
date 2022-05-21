import { join } from "path";

import pLimit from 'p-limit';

export const limit = pLimit(1);

export const __project_name = 'StryxPack';
export const __project_introduction = __project_name + ' By Connor \'Stryxus\' Shearer.\n';

export const __cache_filename = join(__dirname, __project_name.toLocaleLowerCase() + '-cache.json');

export let __is_Debug = false;
export let __has_Update_Queued = false;

export function setDebugMode() { __is_Debug = true; }

export function setHasUpdateQueued(val: boolean)
{
    __has_Update_Queued = val;
}