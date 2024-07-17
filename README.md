# JPEG Time Mismatch Fixer

This project is a utility to fix time mismatches in the EXIF data of JPEG images. It adjusts the `DateTimeOriginal` and `DateTimeDigitized` EXIF fields based on a specified offset.

## Features

- Extracts EXIF data from JPEG files.
- Updates the `DateTimeOriginal` and `DateTimeDigitized` EXIF fields with a new timestamp based on an offset.
- Processes multiple files concurrently for faster performance.

## Requirements

- Node.js
- [Piexifjs](https://github.com/hMatoba/piexifjs)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd JPEG-Time-Mismatch-Fixer
    ```

2. Install the required dependencies:
    ```sh
    npm install
    ```

## Usage

1. Place your JPEG images in the `JPEG-Time-Mismatch-Fixer/images/` directory.

2. Run the script:
    ```sh
    node <script-filename>.js
    ```

## Script Overview

### Utility Functions

#### `getBinaryDataFromJpegFile(filename)`
Reads the binary data from a JPEG file.

#### `getExifFromJpegFile(filename)`
Extracts the EXIF data from a JPEG file.

#### `getJpegFileFromBinaryData(binaryString, filename)`
Writes binary data to a JPEG file.

#### `chunkArray(array, size)`
Splits an array into smaller chunks of the specified size.

#### `getNewTimestamp(originalTimestamp, offset)`
Generates a new timestamp by applying the offset to the original timestamp.

#### `updateImageExifData(imagePath, offset)`
Updates the EXIF data of a JPEG file with a new timestamp.

### Main Function

The `fixer` function processes all JPEG files in the specified folder, updating their EXIF data based on the offset.

## Future Additions

1. Add command line arguments or inputs for offset.
2. Add command line arguments or inputs for folder path.