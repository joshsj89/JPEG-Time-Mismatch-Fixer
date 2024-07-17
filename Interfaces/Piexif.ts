interface Piexif {
    version: string;
    remove: (jpeg: string) => string;
    insert: (exif: string, jpeg: string) => string;
    load: (data: string) => object;
    dump: (exif_dict: object) => string;
    TAGS: object;
    ImageIFD: object;
    ExifIFD: object;
    GPSIFD: object;
    InteropIFD: object;
    FirstIFD: object;
    zeroth: object;
    exif: object;
    gps: object;
    interop: object;
    first: object;
    thumbnail: object;
}

export = Piexif;