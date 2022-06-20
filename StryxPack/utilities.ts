import { constants } from 'fs';
import { access, readdir } from 'fs/promises';
import { join, sep } from 'path';
import cp, { ExecException } from 'child_process';

// Object Literal Interfaces
export interface FileInfo { path: string; name: string }

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
    try
    {
        await access(path, constants.F_OK | constants.W_OK | constants.R_OK);
        return true;
    }
    catch
    {
        return false;
    }
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