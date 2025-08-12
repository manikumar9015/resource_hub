// backend/models/resource.model.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    semester: { 
        type: String, 
        required: true 
    },
    // This is the direct URL to the file hosted on Cloudinary
    fileUrl: { 
        type: String, 
        required: true 
    },
    // This is the public_id from Cloudinary, which is needed if we ever want to delete the file from Cloudinary
    publicId: { 
        type: String, 
        required: true 
    },
    // This creates the link to the User model.
    uploader: {
        type: mongoose.Schema.Types.ObjectId, // This stores the user's unique _id
        required: true,
        ref: 'User', // This tells Mongoose that this ID refers to a document in the 'User' collection
    },
    approved: {
        type: Boolean,
        required: true,
        default: false, // All resources must be approved by a faculty member before they are visible
    },
    ratings: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        rating: { 
            type: Number, 
            required: true,
            min: 1, 
            max: 5 
        },
    }],
    averageRating: { 
        type: Number, 
        default: 0 
    },
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;