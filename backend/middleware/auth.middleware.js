// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

// Middleware to protect routes that require a logged-in user
const protect = async (req, res, next) => {
    let token;

    // Check if the 'Authorization' header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the header (it's in the format "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key from our .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with the token's ID.
            // We use .select('-password') to ensure the hashed password is not attached to the request object.
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // If everything is okay, call next() to proceed to the actual route handler
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If there's no token in the header at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check for 'Faculty' or 'Admin' role
const faculty = (req, res, next) => {
    if (req.user && (req.user.role === 'Faculty' || req.user.role === 'Admin')) {
        next(); // User has the required role, proceed
    } else {
        res.status(403).json({ message: 'Not authorized. Faculty or Admin access required.' });
    }
};

// Middleware to check for 'Admin' role ONLY
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next(); // User is an admin, proceed to the controller
    } else {
        res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
};



module.exports = { protect, faculty, admin };