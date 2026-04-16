const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function uploadToCloudinary(filePath) {
    const cloudName = 'domjpalmx';
    const apiKey = '112197237416717';
    const apiSecret = 'szUDa4TAvdMtaM9q_tf-IPyJays';
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureRaw = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureRaw).digest('hex');

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    const formData = new FormData();
    formData.append('file', blob, path.basename(filePath));
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        console.log(JSON.stringify(data));
    } catch (err) {
        console.error("Error:", err);
    }
}

const fileToUpload = process.argv[2];
if (fileToUpload) {
    uploadToCloudinary(fileToUpload);
}
