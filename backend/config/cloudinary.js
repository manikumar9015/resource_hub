// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with the credentials from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer-storage-cloudinary
// This tells multer to upload files to a specific folder in your Cloudinary account.
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'docu-mentor-ai-resources',
        resource_type: 'auto',
        access_mode: 'public', // <-- THIS IS THE NEW FIX
        public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
    },
});

// Create the multer instance that uses our configured storage
const upload = multer({ storage: storage });

module.exports = upload;