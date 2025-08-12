// backend/controllers/auth.controller.js
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');

// A helper function to sign and generate a JWT.
// It takes a user's ID as a payload, signs it with our secret key from the .env file,
// and sets it to expire in 30 days.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    // 1. Get user data from the request body
    const { name, email, password, role } = req.body;

    try {
        // 2. Check if the user already exists in the database
        const userExists = await User.findOne({ email });

        if (userExists) {
            // If user exists, send a 400 Bad Request response
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. If user doesn't exist, create a new user document
        // The password will be automatically hashed by the 'pre-save' hook in the User model
        const user = await User.create({
            name,
            email,
            password,
            role, // role is optional, will default to 'Student' if not provided
        });

        // 4. If user was created successfully, send back user data and a token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate (login) a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    // 1. Get login credentials from the request body
    const { email, password } = req.body;

    try {
        // 2. Find the user by email. We use .select('+password') because we set `select: false`
        // in our model, so we have to explicitly ask for the password when we need it.
        const user = await User.findOne({ email }).select('+password');

        // 3. Check if user exists AND if the entered password matches the stored hashed password.
        // We use the `matchPassword` method we defined on our user model.
        if (user && (await user.matchPassword(password))) {
            // 4. If credentials are correct, send back user data and a token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            // If credentials do not match, send a 401 Unauthorized response
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};