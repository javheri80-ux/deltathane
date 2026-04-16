const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

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
app.get('/api/data', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        res.json(JSON.parse(data));
    });
});

// API: Save Data (Protected)
app.post('/api/save', basicAuth, (req, res) => {
    const newData = req.body;
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(newData, null, 2), (err) => {
        if (err) return res.status(500).send('Error saving data');
        res.send({ success: true });
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
            res.status(500).send('Error uploading towards Cloudinary');
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
