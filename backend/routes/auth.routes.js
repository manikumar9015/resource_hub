// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

// Import the controller functions we just created
const { 
    registerUser, 
    loginUser 
} = require('../controllers/auth.controller.js');

// When a POST request is made to '/register', execute the registerUser function.
// The full URL will be '/api/auth/register' because of how we'll set it up in server.js
router.post('/register', registerUser);

// When a POST request is made to '/login', execute the loginUser function.
// The full URL will be '/api/auth/login'
router.post('/login', loginUser);

module.exports = router;