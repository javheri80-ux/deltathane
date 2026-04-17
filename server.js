const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true); // This will automatically use the CLOUDINARY_URL from process.env
} else {
  console.warn("CLOUDINARY_URL not found in .env file. Uploads will fail.");
}

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic Auth Middleware for Admin Routes
const basicAuth = (req, res, next) => {
  const authheader = req.headers.authorization;
  if (!authheader) {
      res.setHeader('WWW-Authenticate', 'Basic');
      return res.status(401).send('Authentication required.');
  }

  const auth = Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
      next();
  } else {
      res.setHeader('WWW-Authenticate', 'Basic');
      return res.status(401).send('Authentication failed.');
  }
};

// Serve static files safely, ignore dotfiles by default
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

// API: Get Data
app.get('/api/data', async (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        res.json(JSON.parse(data));
    });
});

// API: Save Data (Protected) & Update HTML Statistically
app.post('/api/save', basicAuth, (req, res) => {
    const newData = req.body;
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(newData, null, 2), (err) => {
        if (err) return res.status(500).send('Error saving data');
        
        try {
            const htmlPath = path.join(__dirname, 'index.html');
            let html = fs.readFileSync(htmlPath, 'utf8');
            const $ = cheerio.load(html);
            
            // Text Replacements
            const textKeys = ['heroTitle', 'heroSubtitle', 'projectVideoTitle', 'projectVideoSubtitle', 'peacefulVistaTitle', 'peacefulVistaText1', 'peacefulVistaText2', 'infinityLifeTitle', 'infinityLifeSubtitle', 'comfortTitle', 'comfortSubtitle', 'locationTitle', 'locationSubtitle', 'floorPlanTitle', 'floorPlanSubtitle', 'whySpecialTitle', 'whySpecialText1', 'whySpecialText2', 'whySpecialText3', 'contactTitle', 'contactSubtitle'];
            textKeys.forEach(key => {
                if(newData[key]) $(`#${key}`).text(newData[key]);
            });

            // Image Replacements
            const imgKeys = ['img_projectVideo', 'img_infinity1', 'img_infinity2', 'img_infinity3', 'img_infinity4', 'img_comfort', 'img_floor1', 'img_floor2'];
            imgKeys.forEach(key => {
                if(newData[key]) $(`#${key}`).attr('src', newData[key]);
            });

            if(newData.logo) {
                $('#logo-img').attr('src', newData.logo);
            }

            if(newData.banners && newData.banners.length > 0) {
                $('.hero').attr('style', `background: linear-gradient(rgba(0,59,34,0.3), rgba(0,59,34,0.3)), url('${newData.banners[0]}') no-repeat center center/cover;`);
            }

            if(newData.gallery && newData.gallery.length > 0) {
                $('#dynamic-gallery-section').css('display', 'block');
                let galleryHtml = '';
                newData.gallery.forEach(url => {
                    const isVid = url.match(/\.(mp4|webm)$/i) || url.includes('/video/upload/');
                    if(isVid) {
                        galleryHtml += `<video src="${url}" controls style="max-width:300px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></video>\n`;
                    } else {
                        galleryHtml += `<img src="${url}" style="max-width:300px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">\n`;
                    }
                });
                $('#dynamic-gallery-container').html(galleryHtml);
            } else {
                $('#dynamic-gallery-section').css('display', 'none');
                $('#dynamic-gallery-container').html('');
            }

            fs.writeFileSync(htmlPath, $.html());
            res.send({ success: true });
        } catch (htmlErr) {
            console.error(htmlErr);
            res.status(500).send('Error editing HTML');
        }
    });
});

// API: Upload Media to Cloudinary (Protected)
app.post('/api/upload', basicAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    cloudinary.uploader.upload(dataURI, { resource_type: 'auto' })
        .then(result => {
            res.send({ success: true, url: result.secure_url });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ success: false, message: 'Cloudinary upload failed: ' + err.message });
        });
});

// Admin Route mapping (domain/upload.html or domain/admin.html)
app.get('/upload.html', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Admin panel at http://localhost:${port}/upload.html`);
});
