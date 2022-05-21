import { constants, Dirent } from 'fs';
import { access, readdir } from 'fs/promises';
import { join, resolve, sep } from 'path';
import cp, { ExecException } from 'child_process';

export const __dirname = resolve();

// Directories
export const __project_dirname = join(__dirname, '../');
export const __server_dirname = join(__project_dirname, 'UEFI');
export const __client_dirname = join(__project_dirname, 'OS');

export const __client_wwwroot_dirname = join(__client_dirname, 'wwwroot');
export const __client_wwwrootdev_dirname = join(__client_dirname, 'wwwroot-dev');

// Special Strings
export const __special_characters_regex = /[ `!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]/;

// Object Literal Interfaces
export interface FileInfo { path: string; name: string }
export interface SettingsManifest { version: number }
export interface AssetCache { path: string; hash: number }
export interface AssetCacheManifest { manifest: Array<AssetCache> }

export function literalCast<T>(value: T): T { return value; }

// Utility Functions

export function exec(cmd: string)
{
    return new Promise((done, failed) =>
    {
        cp.exec(cmd, { ...{ log: false, cwd: process.cwd() } }, (err: ExecException | null) =>
        {
            if (err)
            {
                failed(err);
                return;
            }
            done(err);
        })
    })
}

export async function fileExists(path: string): Promise<boolean>
{
    await access(path, constants.R_OK | constants.W_OK).then(() => { return true; }).catch(() => { return false; });
    return false;
}

export async function findFiles(path: string): Promise<Array<FileInfo>>
{
    const entries = await readdir(path, { withFileTypes: true });
    const files = entries.filter(file => !file.isDirectory()).map(file => (literalCast<FileInfo>({ ...file, path: join(path, file.name) })));;
    const folders = entries.filter(folder => folder.isDirectory());
    for (const folder of folders) files.push(...await findFiles(`${path}${sep}${folder.name}${sep}`));
    return files;
}

export function filterFiles(files: Array<FileInfo>, ext: string): Array<FileInfo>
{
    return Object.values(files).filter(file => String(file.name).split('.').pop() === ext);
}

export function isUpperCase(str: string): boolean
{
    return str === str.toUpperCase();
}

export function isEmptyOrSpaces(str: string): boolean
{
    return str === null || str.match(/^ *$/) !== null;
}