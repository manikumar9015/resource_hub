// backend/models/comment.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: true 
    },
    // Link to the user who posted the comment
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Establishes a relationship with the User model
    },
    // Link to the resource the comment is for
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Resource', // Establishes a relationship with the Resource model
    },
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;