interface Path {
    normalize(path: string): string;
    join(...paths: any[]): string;
    resolve(...pathSegments: any[]): string;
    isAbsolute(path: string): boolean;
    relative(from: string, to: string): string;
    dirname(path: string): string;
    basename(path: string, ext?: string): string;
    extname(path: string): string;
    format(pathObject: any): string;
    parse(pathString: string): any;
    sep: string;
    delimiter: string;
    win32: any;
    posix: any;
    _makeLong(path: string): string;
}

export = Path;