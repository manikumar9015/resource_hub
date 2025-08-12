// backend/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true, // No two users can have the same email
        match: [ // A simple check to ensure the email format is valid
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // When we query for a user, don't include the password field by default
    },
    role: {
        type: String,
        enum: ['Student', 'Faculty', 'Admin'], // The role must be one of these three values
        default: 'Student', // If no role is specified during creation, they become a 'Student'
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource', // This creates a relationship with the Resource model (which we'll create soon)
    }],
}, { 
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// This is a "pre-save hook". It runs automatically *before* a user document is saved to the database.
userSchema.pre('save', async function (next) {
    // If the password hasn't been changed, we don't need to re-hash it.
    if (!this.isModified('password')) {
        next();
    }

    // Generate a "salt" to make the hash more secure against certain attacks.
    const salt = await bcrypt.genSalt(10);
    // Now, hash the user's plain-text password and store that instead.
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// This adds a custom method to our user schema called `matchPassword`.
// We'll use it during login to compare the password the user provides with the hashed password in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
    // `select: false` on the password field means we have to explicitly ask for it when we need it.
    // However, `this.password` will be available here because we are in the context of the document itself.
    return await bcrypt.compare(enteredPassword, this.password);
};


// Create the model from the schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;