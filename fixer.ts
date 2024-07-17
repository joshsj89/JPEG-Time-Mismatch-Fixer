import EXIF = require("./Interfaces/EXIF");
import FS = require("./Interfaces/FS");
import Piexif = require("./Interfaces/Piexif");

const fs: FS = require('fs');
const path = require('path');
const piexif: Piexif = require('piexifjs');



/*
36867: DateTimeOriginal
36868: DateTimeDigitized
37521: SubsecTimeOriginal
*/

const folderPath = 'JPEG-Time-Mismatch-Fixer/images/';

// Utility Functions

const getBinaryDataFromJpegFile = (filename: string): string => {
    return fs.readFileSync(filename).toString('binary');
}

const getExifFromJpegFile = (filename: string): EXIF => {
    return piexif.load(getBinaryDataFromJpegFile(filename));
}

const getJpegFileFromBinaryData = (binaryString: WithImplicitCoercion<string>, filename: string) => {
    const imageBuffer = Buffer.from(binaryString, 'binary');
    fs.writeFileSync(filename, imageBuffer);
}

////////////////////////////////////////////////////////////////////////////////

const chunkArray = (array: string[], size: number): string[][] => {
    const chunks: string[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

const getNewTimestamp = (originalTimestamp: string, offset: string) => {
    const originalTimestampParts = originalTimestamp.split(/[:\s]/);
    const date = new Date(
        Number(originalTimestampParts[0]), 
        Number(originalTimestampParts[1]) - 1, 
        Number(originalTimestampParts[2]), 
        Number(originalTimestampParts[3]), 
        Number(originalTimestampParts[4]), 
        Number(originalTimestampParts[5])
    );

    const operation = offset[0];

    const offsetParts = offset.slice(1).split(/[:\s]/);
    let newTimestampParts: string[] = [];

    originalTimestampParts.forEach((part, i) => {
        
        // If offset is 0, keep original timestamp value
        if (offsetParts[i] === '00' || offsetParts[i] === '000' || offsetParts[i] === '0000') {
            newTimestampParts[i] = part;
        } else {
            
            if (operation === '+') { // Add offset to timestamp
                newTimestampParts[i] = String(Number(part) + Number(offsetParts[i]));
            } else if (operation === '-') { // Subtract offset from timestamp
                newTimestampParts[i] = String(Number(part) - Number(offsetParts[i]));
            }
        }
    });

    const newDate = new Date(
        Number(newTimestampParts[0]), 
        Number(newTimestampParts[1]) - 1, 
        Number(newTimestampParts[2]), 
        Number(newTimestampParts[3]), 
        Number(newTimestampParts[4]), 
        Number(newTimestampParts[5])
    );

    return newDate;
}

const updateImageExifData = (imagePath: string, offset: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const exifData = getExifFromJpegFile(imagePath);
        const originalTimestamp = exifData.Exif ? exifData.Exif['36867'] : null;
        const subSecTime = exifData.Exif ? exifData.Exif['37521'] : null;
        
        const newDate = getNewTimestamp(originalTimestamp, offset);
        newDate.setMilliseconds(Number(subSecTime));
        const newTimestamp = `${newDate.getFullYear()}:${(newDate.getMonth() + 1).toString().padStart(2, '0')}:${newDate.getDate().toString().padStart(2, '0')} ${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}:${newDate.getSeconds().toString().padStart(2, '0')}`;
        
        if (exifData.Exif) {
            exifData.Exif['36867'] = newTimestamp;
            exifData.Exif['36868'] = newTimestamp;
            
            const exifDump = piexif.dump(exifData)
            
            const binaryData = piexif.insert(exifDump, getBinaryDataFromJpegFile(imagePath));
            
            getJpegFileFromBinaryData(binaryData, imagePath);
        
            // Update file's Modified and Accessed dates
            fs.utimesSync(imagePath, new Date(), newDate);
        }

        resolve();
    });
    
}

const fixer = async () => {

    const concurrency = 100; // Number of files to process at a time

    const files: string[] = fs.readdirSync(folderPath); 

    try {
        const offset = '-0000:00:00 03:00:12';
    
        const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');
        const chunks = chunkArray(jpgFiles, concurrency); // Split files into chunks
    
        for (const chunk of chunks) {
            const promises = chunk.map(file => {
                const filePath: string = path.join(folderPath, file);
                return updateImageExifData(filePath, offset);
            });
            await Promise.all(promises);
        }
    } catch (err) {
        console.error('Error reading folder:', err);
        return;
    }

    console.log('Complete');
}

fixer();


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Next Steps:
//      -Add command line arguments or inputs for offset
//      -Add command line arguments or inputs for folder path