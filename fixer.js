const fs = require('fs');
const path = require('path');
const piexif = require('piexifjs');

/*
36867: DateTimeOriginal
36868: DateTimeDigitized
*/

//  Canon EOS Rebel T3i: 00:04:16 ahead (4 minutes, 16 seconds)

// 2023:06:28 10:40:22 -> 2023-06-28T10:44:22

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

const getNewTimestamp = (originalTimestamp, originalSubsecTime, offset) => {
    const originalTimestampParts = originalTimestamp.split(/[:\s]/);
    const date = new Date(
        originalTimestampParts[0], 
        originalTimestampParts[1] - 1, 
        originalTimestampParts[2], 
        originalTimestampParts[3], 
        originalTimestampParts[4], 
        originalTimestampParts[5], 
        originalSubsecTime);
    console.log('Old ' + date.toISOString());

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
        newTimestampParts[5], 
        originalSubsecTime);

    console.log('New ' + newDate.toISOString());
}

const updateImageExifData = (imagePath, offset) => {
    const exifData = getExifFromJpegFile(imagePath);
    const originalTimestamp = exifData.Exif['36867'];
    const originalSubsecTime = exifData.Exif['37521'];
    
    const newTimestamp = getNewTimestamp(originalTimestamp, originalSubsecTime, offset);
    
    //exifData.Exif['36867'] = newTimestamp;
    //exifData.Exif['36868'] = newTimestamp;
    
    //const exifDump = piexif.dump(exifData)
    
    //const temp = piexif.insert(exifDump, getBinaryDataFromJpegFile(imagePath));
    
    //getJpegFileFromBinaryData(temp, imagePath);
}

try {
    const files = fs.readdirSync(folderPath);

    const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');

    const offset = '+0000:00:00 00:04:16';
    
    jpgFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        updateImageExifData(filePath, offset);
    });

    
} catch (err) {
    console.error('Error reading folder: ', err);
}

/* // Async version
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }

    const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');
    
    jpgFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        updateImageExifData(filePath);
    });
});
*/

console.log('Complete');