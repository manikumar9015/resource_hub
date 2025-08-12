// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();

// Import the controller functions we created
const { 
    toggleBookmark,
    getMyBookmarks 
} = require('../controllers/user.controller.js');

// Import the authentication middleware
const { protect } = require('../middleware/auth.middleware.js');

// Define the route for getting the user's bookmarks.
// A GET request to /api/users/bookmarks will trigger getMyBookmarks.
// It's protected, so only the logged-in user can see their own bookmarks.
router.get('/bookmarks', protect, getMyBookmarks);

// Define the route for adding/removing a bookmark.
// A PUT request to /api/users/bookmarks/:resourceId will trigger toggleBookmark.
// It's also protected.
router.put('/bookmarks/:resourceId', protect, toggleBookmark);


module.exports = router;