const fs = require('fs');
const path = require('path');
const piexif = require('piexifjs');

/*
36867: DateTimeOriginal
36868: DateTimeDigitized
37521: SubsecTimeOriginal
*/

const folderPath = 'JPEG-Time-Mismatch-Fixer/images/';

// Utility Functions

const getBinaryDataFromJpegFile = (filename) => {
    return fs.readFileSync(filename).toString('binary');
}

const getExifFromJpegFile = (filename) => {
    return piexif.load(getBinaryDataFromJpegFile(filename));
}

const getJpegFileFromBinaryData = (binaryString, filename) => {
    const imageBuffer = Buffer.from(binaryString, 'binary');
    fs.writeFileSync(filename, imageBuffer);
}

////////////////////////////////////////////////////////////////////////////////

const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

const getNewTimestamp = (originalTimestamp, offset) => {
    const originalTimestampParts = originalTimestamp.split(/[:\s]/);
    const date = new Date(
        originalTimestampParts[0], 
        originalTimestampParts[1] - 1, 
        originalTimestampParts[2], 
        originalTimestampParts[3], 
        originalTimestampParts[4], 
        originalTimestampParts[5]);

    const operation = offset[0];

    const offsetParts = offset.slice(1).split(/[:\s]/);
    let newTimestampParts = [];

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
        newTimestampParts[0], 
        newTimestampParts[1] - 1, 
        newTimestampParts[2], 
        newTimestampParts[3], 
        newTimestampParts[4], 
        newTimestampParts[5]);

    return newDate;
}

const updateImageExifData = (imagePath, offset) => {
    const exifData = getExifFromJpegFile(imagePath);
    const originalTimestamp = exifData.Exif['36867'];
    const subSecTime = exifData.Exif['37521'];
    
    const newDate = getNewTimestamp(originalTimestamp, offset);
    newDate.setMilliseconds(Number(subSecTime));
    const newTimestamp = `${newDate.getFullYear()}:${(newDate.getMonth() + 1).toString().padStart(2, '0')}:${newDate.getDate().toString().padStart(2, '0')} ${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}:${newDate.getSeconds().toString().padStart(2, '0')}`;
    
    exifData.Exif['36867'] = newTimestamp;
    exifData.Exif['36868'] = newTimestamp;
    
    const exifDump = piexif.dump(exifData)
    
    const binaryData = piexif.insert(exifDump, getBinaryDataFromJpegFile(imagePath));
    
    getJpegFileFromBinaryData(binaryData, imagePath);

    // Update file's Modified and Accessed dates
    fs.utimesSync(imagePath, new Date(), newDate);
}

const fixer = async () => {

    const concurrency = 50; // Number of files to process at a time

    const files = fs.readdirSync(folderPath); 

    try {
        const offset = '+0000:00:00 00:04:16';
    
        const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');
        const chunks = chunkArray(jpgFiles, concurrency); // Split files into chunks
    
        for (const chunk of chunks) {
            const promises = chunk.map(file => {
                const filePath = path.join(folderPath, file);
                updateImageExifData(filePath, offset);
            });
            await Promise.all(promises);
        }
    } catch (err) {
        console.error('Error reading folder:', err);
        return;
    }
}

fixer();

console.log('Complete');

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Next Steps:
//      -Add command line arguments or inputs for offset
//      -Add command line arguments or inputs for folder path