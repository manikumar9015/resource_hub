// backend/controllers/user.controller.js
const User = require('../models/user.model.js');
const Resource = require('../models/resource.model.js');

/**
 * @desc    Add or remove a bookmark for a user.
 * @route   PUT /api/users/bookmarks/:resourceId
 * @access  Private (requires user to be logged in)
 */
const toggleBookmark = async (req, res) => {
    // The user's ID comes from the 'protect' middleware.
    const userId = req.user._id; 
    // The resource ID comes from the URL parameter.
    const { resourceId } = req.params;

    try {
        // Find both the user and the resource to make sure they exist.
        const user = await User.findById(userId);
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if the resourceId is already in the user's bookmarks array.
        const bookmarkIndex = user.bookmarks.indexOf(resourceId);

        let action;
        if (bookmarkIndex > -1) {
            // If it exists (index is 0 or greater), remove it from the array.
            user.bookmarks.splice(bookmarkIndex, 1);
            action = 'removed';
        } else {
            // If it doesn't exist (index is -1), add it to the array.
            user.bookmarks.push(resourceId);
            action = 'added';
        }

        // Save the updated user document.
        await user.save();
        
        // Send a success response.
        res.status(200).json({ 
            message: `Bookmark ${action} successfully.`,
            bookmarks: user.bookmarks, // Send back the updated list of bookmarks.
        });

    } catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({ message: 'Server Error while toggling bookmark' });
    }
};

/**
 * @desc    Get the current user's bookmarks.
 * @route   GET /api/users/bookmarks
 * @access  Private
 */
const getMyBookmarks = async (req, res) => {
    try {
        // Find the user and populate the bookmarks with resource details
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            model: 'Resource',
            populate: { // Nested populate to get uploader details
                path: 'uploader',
                model: 'User',
                select: 'name'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.bookmarks);

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ message: 'Server error while fetching bookmarks' });
    }
};

module.exports = {
    toggleBookmark,
    getMyBookmarks, // <-- Export the new function
};