interface FS {
    readdirSync(path: string, options?: { encoding: string; withFileTypes?: false } | string): string[];
    readdirSync(path: string, options: { encoding: BufferEncoding; withFileTypes?: false } | BufferEncoding): Buffer[];
    readdirSync(path: string, options?: { encoding?: string | null; withFileTypes?: false } | string | null): string[] | Buffer[];

    readFileSync(path: string | number | Buffer | URL, options?: { encoding?: string | null; flag?: string; } | undefined | string | null): Buffer;

    writeFileSync(path: string | number | Buffer | URL, data: any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void;
    writeFileSync(path: string | number | Buffer | URL, data: any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void;

    utimesSync(path: string | Buffer | URL, atime: string | number | Date, mtime: string | number | Date): void;
}

export = FS;